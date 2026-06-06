import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as https from 'https';
import * as http from 'http';
import { Customer } from '../customers/entities/customer.entity';
import { Faktur } from '../meter/entities/faktur.entity';
import { HistoryMeter } from '../meter/entities/history-meter.entity';
import { MeterPhoto } from '../meter/entities/meter-photo.entity';

// Penanda data demo: nomor faktur berawalan 'SED/'.
const DEMO_PREFIX = 'SED/%';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Customer)     private readonly customers: Repository<Customer>,
    @InjectRepository(Faktur)       private readonly faktur: Repository<Faktur>,
    @InjectRepository(HistoryMeter) private readonly history: Repository<HistoryMeter>,
    @InjectRepository(MeterPhoto)   private readonly photos: Repository<MeterPhoto>,
  ) {}

  async seedDemo(tenantId: number): Promise<{ inserted: number; photos: number; message: string }> {
    const now    = new Date();
    const m      = now.getMonth() + 1;
    const y      = now.getFullYear();
    const mStr   = String(m).padStart(2, '0');
    const target = 0.38; // 38%

    // Semua pelanggan tenant
    const allCustomers = await this.customers.find({ where: { tenantId }, order: { id: 'ASC' } });
    if (allCustomers.length === 0) return { inserted: 0, photos: 0, message: 'Tidak ada pelanggan' };

    // Pelanggan yang SUDAH punya faktur bulan ini
    const existingRaw = await this.faktur
      .createQueryBuilder('f')
      .select('DISTINCT f.customer', 'cid')
      .where('MONTH(f.tanggal) = :m AND YEAR(f.tanggal) = :y AND f.tenant_id = :tid', { m, y, tid: tenantId })
      .getRawMany<{ cid: string }>();
    const existingIds = new Set(existingRaw.map(r => String(r.cid)));

    // Pelanggan yang belum dicatat
    const notRecorded = allCustomers.filter(c => !existingIds.has(String(c.id)));
    const needed = Math.round(allCustomers.length * target) - existingIds.size;
    if (needed <= 0) return { inserted: 0, photos: 0, message: `Sudah ${existingIds.size}/${allCustomers.length} (${Math.round(existingIds.size / allCustomers.length * 100)}%)` };

    // Pilih acak 'needed' pelanggan dari yang belum tercatat
    const shuffled = [...notRecorded].sort(() => Math.random() - 0.5);
    const toSeed   = shuffled.slice(0, needed);

    // Indeks mana yang dapat foto (10 pertama)
    const PHOTO_COUNT = Math.min(10, toSeed.length);

    let inserted = 0;
    let photos   = 0;
    const tanggal = new Date(y, m - 1, 10); // tanggal 10 bulan ini
    const dueDate = `${y}-${mStr}-20`;

    for (let i = 0; i < toSeed.length; i++) {
      const cust = toSeed[i];
      const lastH = await this.history.findOne({ where: { idPelanggan: cust.id, tenantId }, order: { id: 'DESC' } });
      const lastMeter = lastH?.meter ?? 1000;
      const usage    = 10 + Math.floor(Math.random() * 30); // 10-40 m³
      const newMeter = lastMeter + usage;
      const subtotal = usage * 1800;
      const total    = subtotal + 5000;
      const noFaktur = `SED/${String(y).slice(2)}/${mStr}/${String(cust.id).padStart(4, '0')}`;
      const fname    = `pic_${noFaktur.replace(/\//g, '-')}_${cust.id}.jpeg`;

      // Download foto ke memori → simpan BLOB ke DB (10 pertama)
      let fotoMeter: string | null = null;
      if (i < PHOTO_COUNT) {
        try {
          const buf = await downloadImageBuffer(`https://picsum.photos/seed/${cust.id}/400/300`);
          await this.photos.save({ noFaktur, tenantId, mime: 'image/jpeg', data: buf, createdAt: new Date() });
          fotoMeter = fname;
          photos++;
        } catch { /* foto gagal, lanjut */ }
      }

      await this.history.save({
        tenantId, idPelanggan: cust.id, noFaktur,
        meter: newMeter,
        tanggalCatat: `${y}-${mStr}-10`,
        jamCatat: '09:00:00',
      });

      await this.faktur.save({
        tenantId, noFaktur, tanggal, periode: `${y}-${mStr}`,
        customer: String(cust.id), subtotal, beban: 5000,
        total, tglJatuhTempo: dueDate,
        isDone: 1, isLunas: 0, fotoMeter,
        catatan: 'Seed data demo',
        jenis: 'pos',
      });

      inserted++;
    }

    const finalDone = existingIds.size + inserted;
    const pct = Math.round(finalDone / allCustomers.length * 100);
    return { inserted, photos, message: `${finalDone}/${allCustomers.length} (${pct}%) tercatat` };
  }

  /** Hapus semua data demo (faktur/history/foto berawalan SED/). */
  async cleanupDemo(): Promise<{ faktur: number; history: number; photos: number }> {
    const delFaktur = await this.faktur.createQueryBuilder()
      .delete().where('no_faktur LIKE :p', { p: DEMO_PREFIX }).execute();
    const delHistory = await this.history.createQueryBuilder()
      .delete().where('no_faktur LIKE :p', { p: DEMO_PREFIX }).execute();
    const delPhotos = await this.photos.createQueryBuilder()
      .delete().where('no_faktur LIKE :p', { p: DEMO_PREFIX }).execute();
    return {
      faktur: delFaktur.affected ?? 0,
      history: delHistory.affected ?? 0,
      photos: delPhotos.affected ?? 0,
    };
  }

  // Auto-purge data demo tiap hari jam 03:00 (hygiene 1x24 jam).
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async scheduledCleanup() {
    try {
      const r = await this.cleanupDemo();
      if (r.faktur || r.history || r.photos) {
        this.logger.log(`Auto-cleanup demo: ${r.faktur} faktur, ${r.history} history, ${r.photos} foto`);
      }
    } catch (e) {
      this.logger.warn(`Auto-cleanup demo gagal: ${(e as Error).message}`);
    }
  }
}

// Download gambar ke Buffer di memori (follow redirect).
function downloadImageBuffer(url: string, depth = 0): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    if (depth > 5) return reject(new Error('Too many redirects'));
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (res) => {
      if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location) {
        res.resume();
        return downloadImageBuffer(res.headers.location, depth + 1).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const chunks: Buffer[] = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}
