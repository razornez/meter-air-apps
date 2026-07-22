import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as https from 'https';
import * as http from 'http';
import { Customer } from '../customers/entities/customer.entity';
import { Faktur } from '../meter/entities/faktur.entity';
import { HistoryMeter } from '../meter/entities/history-meter.entity';
import { MeterPhoto } from '../meter/entities/meter-photo.entity';
import { Tenant } from '../auth/entities/tenant.entity';

// Penanda data demo: nomor faktur berawalan 'SED/'.
const DEMO_PREFIX = 'SED/%';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Customer)     private readonly customers: Repository<Customer>,
    @InjectRepository(Faktur)       private readonly faktur: Repository<Faktur>,
    @InjectRepository(HistoryMeter) private readonly history: Repository<HistoryMeter>,
    @InjectRepository(MeterPhoto)   private readonly photos: Repository<MeterPhoto>,
    @InjectRepository(Tenant)       private readonly tenants: Repository<Tenant>,
    @InjectDataSource()             private readonly db: DataSource,
    private readonly config: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    if (this.config.get<string>('DEMO_BOOTSTRAP_DISABLED', 'false') === 'true') return;
    try {
      const result = await this.ensureDemoEnvironment();
      if (result.seededReadings || result.copiedCustomers || result.createdUsers) {
        this.logger.log(
          `Demo ready: tenant=${result.demoTenantId}, users=${result.createdUsers}, ` +
          `customers+${result.copiedCustomers}, readings+${result.seededReadings}`,
        );
      }
    } catch (e) {
      this.logger.warn(`Bootstrap demo gagal: ${(e as Error).message}`);
    }
  }

  private async ensureDemoEnvironment(): Promise<{
    demoTenantId: number;
    createdUsers: number;
    copiedCustomers: number;
    seededReadings: number;
  }> {
    const demoCode = this.config.get<string>('DEMO_TENANT_CODE', 'DEMO');
    const sourceCode = this.config.get<string>('DEMO_SOURCE_TENANT_CODE', 'BUMDES-KRK');
    const sourceRows = await this.db.query('SELECT id FROM tenants WHERE kode = ? LIMIT 1', [sourceCode]);
    const sourceTenantId = Number(sourceRows[0]?.id ?? 1);

    const tenantResult = await this.db.query(
      `INSERT INTO tenants
       (nama, slug, kode, token, expired_at, grace_period_days, status, paket,
        kontak_nama, alamat, kota, created_at, updated_at)
       VALUES ('Demo Meter Air', 'demo', ?, UUID(), '2027-12-31 23:59:59', 7, 'aktif', 'demo',
        'Demo', 'Data demo aplikasi Meter Air', 'Demo', NOW(), NOW())
       ON DUPLICATE KEY UPDATE
        id = LAST_INSERT_ID(id),
        status = 'aktif',
        expired_at = VALUES(expired_at),
        updated_at = NOW()`,
      [demoCode],
    );
    const demoTenantId = Number(tenantResult.insertId);

    const passwordHash = await bcrypt.hash('password123', 10);
    const demoUsers: Array<[string, string, number]> = [
      ['demo_admin', 'Demo Admin', 1],
      ['demo_manajer', 'Demo Manajer', 1],
      ['demo_kasir', 'Demo Kasir', 0],
      ['demo_petugas', 'Demo Petugas', 0],
    ];
    let createdUsers = 0;
    for (const [username, name, isAdmin] of demoUsers) {
      const result = await this.db.query(
        `INSERT INTO users
         (tenant_id, username, name, password, is_admin, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())
         ON DUPLICATE KEY UPDATE
          tenant_id = VALUES(tenant_id),
          name = VALUES(name),
          password = VALUES(password),
          is_admin = VALUES(is_admin),
          is_active = 1,
          updated_at = NOW()`,
        [demoTenantId, username, name, passwordHash, isAdmin],
      );
      createdUsers += result.affectedRows ?? 0;
    }

    await this.copyIfEmpty('config', sourceTenantId, demoTenantId, [
      'tenant_id', 'show_alert_delete', 'perusahaan', 'logo', 'telp', 'alamat', 'link_app',
      'lisensi', 'show_supplier', 'show_stok_masuk', 'show_stok_keluar', 'show_laporan_stok',
      'show_customer', 'show_ukuran', 'show_opsi_all', 'jenis_faktur', 'created_at', 'updated_at',
    ]);
    await this.copyIfEmpty('level_pemakaian', sourceTenantId, demoTenantId, [
      'tenant_id', 'jenis', 'level', 'harga', 'per_pemakaian', 'per_pemakaian_max', 'created_at', 'updated_at',
    ]);
    const copiedCustomers = await this.copyIfEmpty('customer', sourceTenantId, demoTenantId, [
      'tenant_id', 'urut', 'nama', 'alamat', 'tipe', 'kota', 'rt', 'rw', 'telp', 'no_kk',
      'foto', 'barcode', 'tgl_daftar', 'status', 'created_at', 'updated_at', 'latitude', 'longitude',
    ]);
    const seededReadings = await this.seedMonthlyReadings(demoTenantId);
    return { demoTenantId, createdUsers, copiedCustomers, seededReadings };
  }

  private async copyIfEmpty(
    table: string,
    sourceTenantId: number,
    demoTenantId: number,
    columns: string[],
  ): Promise<number> {
    const rows = await this.db.query(`SELECT COUNT(*) AS total FROM ${table} WHERE tenant_id = ?`, [demoTenantId]);
    if (Number(rows[0]?.total ?? 0) > 0) return 0;

    const selectColumns = columns.map((column) => (column === 'tenant_id' ? '? AS tenant_id' : column));
    const result = await this.db.query(
      `INSERT INTO ${table} (${columns.join(', ')})
       SELECT ${selectColumns.join(', ')}
       FROM ${table}
       WHERE tenant_id = ?`,
      [demoTenantId, sourceTenantId],
    );
    return result.affectedRows ?? 0;
  }

  private async seedMonthlyReadings(tenantId: number): Promise<number> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const shortYear = String(year).slice(2);
    const periode = `${year}-${month}`;

    const existing = await this.db.query(
      'SELECT COUNT(*) AS total FROM faktur WHERE tenant_id = ? AND periode = ? AND no_faktur LIKE "SED/%"',
      [tenantId, periode],
    );
    if (Number(existing[0]?.total ?? 0) > 0) return 0;

    const customers = await this.db.query(
      'SELECT id FROM customer WHERE tenant_id = ? AND status = 1 ORDER BY id ASC LIMIT 80',
      [tenantId],
    );
    let inserted = 0;
    for (const [index, customer] of customers.entries()) {
      const usage = 10 + (index % 31);
      const subtotal = usage * 2000;
      const total = subtotal + 5000;
      const meter = 1000 + index * 13 + usage;
      const noFaktur = `SED/${shortYear}/${month}/${String(customer.id).padStart(4, '0')}`;

      await this.db.query(
        `INSERT INTO history_meter
         (tenant_id, id_pelanggan, no_faktur, meter, tanggal_catat, jam_catat, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, '09:00:00', NOW(), NOW())`,
        [tenantId, customer.id, noFaktur, meter, `${year}-${month}-10`],
      );
      await this.db.query(
        `INSERT INTO faktur
         (tenant_id, no_faktur, tanggal, periode, jenis, subtotal, beban, denda, diskon, ppn,
          biaya_kirim, total, customer, tgl_jatuh_tempo, is_done, is_lunas, catatan, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'pos', ?, 5000, 0, 0, 0, 0, ?, ?, ?, 1, 0, 'Seed data demo', NOW(), NOW())`,
        [tenantId, noFaktur, `${year}-${month}-10 09:00:00`, periode, subtotal, total, String(customer.id), `${year}-${month}-20`],
      );
      inserted++;
    }
    return inserted;
  }

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
      const demoCode = process.env.DEMO_TENANT_CODE ?? 'DEMO';
      const tenant = await this.tenants.findOne({ where: { kode: demoCode } });
      let refresh = 0;
      if (tenant) {
        const customerCount = await this.customers.count({ where: { tenantId: tenant.id } });
        if (customerCount > 0) {
          refresh = await this.seedMonthlyReadings(tenant.id);
        }
      }
      if (r.faktur || r.history || r.photos) {
        this.logger.log(`Auto-cleanup demo: ${r.faktur} faktur, ${r.history} history, ${r.photos} foto`);
      }
      if (refresh) {
        this.logger.log(`Auto-refresh demo ${demoCode}: ${refresh} faktur bulan ini`);
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
