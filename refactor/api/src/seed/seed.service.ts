import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Customer } from '../customers/entities/customer.entity';
import { Faktur } from '../meter/entities/faktur.entity';
import { HistoryMeter } from '../meter/entities/history-meter.entity';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Customer)  private readonly customers: Repository<Customer>,
    @InjectRepository(Faktur)    private readonly faktur: Repository<Faktur>,
    @InjectRepository(HistoryMeter) private readonly history: Repository<HistoryMeter>,
    private readonly config: ConfigService,
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

    // Siapkan upload dir untuk foto
    const uploadDir = this.config.get<string>('UPLOAD_DIR', path.join(process.cwd(), 'uploads/foto_meter'));
    await fs.mkdir(uploadDir, { recursive: true });

    // Indeks mana yang dapat foto (10 pertama)
    const PHOTO_COUNT = Math.min(10, toSeed.length);

    let inserted = 0;
    let photos   = 0;
    const tanggal = new Date(y, m - 1, 10); // tanggal 10 bulan ini
    const dueDate = `${y}-${mStr}-20`;

    for (let i = 0; i < toSeed.length; i++) {
      const cust = toSeed[i];
      // Meter terakhir pelanggan
      const lastH = await this.history.findOne({ where: { idPelanggan: cust.id, tenantId }, order: { id: 'DESC' } });
      const lastMeter = lastH?.meter ?? 1000;
      const usage   = 10 + Math.floor(Math.random() * 30); // 10-40 m³
      const newMeter = lastMeter + usage;
      const subtotal = usage * 1800;
      const total    = subtotal + 5000;
      const noFaktur = `SED/${String(y).slice(2)}/${mStr}/${String(cust.id).padStart(4, '0')}`;

      // Download foto untuk 10 pertama
      let fotoMeter: string | null = null;
      if (i < PHOTO_COUNT) {
        try {
          const fname = `pic_${noFaktur.replace(/\//g, '-')}_${cust.id}.jpeg`;
          const fpath = path.join(uploadDir, fname);
          await downloadImage(`https://picsum.photos/seed/${cust.id}/400/300`, fpath);
          fotoMeter = fname;
          photos++;
        } catch { /* foto gagal, lanjut */ }
      }

      // Insert history_meter
      await this.history.save({
        tenantId, idPelanggan: cust.id, noFaktur,
        meter: newMeter,
        tanggalCatat: `${y}-${mStr}-10`,
        jamCatat: '09:00:00',
      });

      // Insert faktur
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
}

function downloadImage(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = require('fs').createWriteStream(dest);
    protocol.get(url, (res) => {
      // Follow redirect
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        require('fs').unlinkSync(dest);
        return downloadImage(res.headers.location!, dest).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', (err) => {
      require('fs').unlink(dest, () => {});
      reject(err);
    });
  });
}
