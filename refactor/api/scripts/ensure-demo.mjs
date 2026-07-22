import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

function loadEnv(file = '.env') {
  const full = path.resolve(process.cwd(), file);
  if (!fs.existsSync(full)) return;
  const text = fs.readFileSync(full, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).replace(/^export\s+/, '').trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

async function tableExists(db, table) {
  const [rows] = await db.query('SHOW TABLES LIKE ?', [table]);
  return rows.length > 0;
}

async function countRows(db, table, tenantId) {
  if (!(await tableExists(db, table))) return 0;
  const [rows] = await db.query(`SELECT COUNT(*) AS total FROM ${table} WHERE tenant_id = ?`, [tenantId]);
  return Number(rows[0]?.total ?? 0);
}

async function copyIfEmpty(db, table, sourceTenantId, demoTenantId, columns) {
  const current = await countRows(db, table, demoTenantId);
  if (current > 0) return 0;

  const selectColumns = columns.map((column) => (column === 'tenant_id' ? '? AS tenant_id' : column));
  const [result] = await db.query(
    `INSERT INTO ${table} (${columns.join(', ')})
     SELECT ${selectColumns.join(', ')}
     FROM ${table}
     WHERE tenant_id = ?`,
    [demoTenantId, sourceTenantId],
  );
  return result.affectedRows ?? 0;
}

async function seedMonthlyReadings(db, demoTenantId) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const shortYear = String(year).slice(2);

  const [existing] = await db.query(
    'SELECT COUNT(*) AS total FROM faktur WHERE tenant_id = ? AND periode = ? AND no_faktur LIKE "SED/%"',
    [demoTenantId, `${year}-${month}`],
  );
  if (Number(existing[0]?.total ?? 0) > 0) return 0;

  const [customers] = await db.query(
    'SELECT id, tipe FROM customer WHERE tenant_id = ? AND status = 1 ORDER BY id ASC LIMIT 80',
    [demoTenantId],
  );
  if (customers.length === 0) return 0;

  let inserted = 0;
  for (const [index, customer] of customers.entries()) {
    const usage = 10 + (index % 31);
    const subtotal = usage * 2000;
    const total = subtotal + 5000;
    const meter = 1000 + index * 13 + usage;
    const noFaktur = `SED/${shortYear}/${month}/${String(customer.id).padStart(4, '0')}`;

    await db.query(
      `INSERT INTO history_meter
       (tenant_id, id_pelanggan, no_faktur, meter, tanggal_catat, jam_catat, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, '09:00:00', NOW(), NOW())`,
      [demoTenantId, customer.id, noFaktur, meter, `${year}-${month}-10`],
    );
    await db.query(
      `INSERT INTO faktur
       (tenant_id, no_faktur, tanggal, periode, jenis, subtotal, beban, denda, diskon, ppn,
        biaya_kirim, total, customer, tgl_jatuh_tempo, is_done, is_lunas, catatan, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'pos', ?, 5000, 0, 0, 0, 0, ?, ?, ?, 1, 0, 'Seed data demo', NOW(), NOW())`,
      [demoTenantId, noFaktur, `${year}-${month}-10 09:00:00`, `${year}-${month}`, subtotal, total, String(customer.id), `${year}-${month}-20`],
    );
    inserted++;
  }
  return inserted;
}

async function main() {
  loadEnv();

  const db = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USERNAME || process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'meterair',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  });

  const sourceCode = process.env.DEMO_SOURCE_TENANT_CODE || 'BUMDES-KRK';
  const demoCode = process.env.DEMO_TENANT_CODE || 'DEMO';

  const [sourceRows] = await db.query('SELECT id FROM tenants WHERE kode = ? LIMIT 1', [sourceCode]);
  const sourceTenantId = Number(sourceRows[0]?.id ?? 1);

  const [tenantResult] = await db.query(
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
  const demoUsers = [
    ['demo_admin', 'Demo Admin', 1],
    ['demo_manajer', 'Demo Manajer', 1],
    ['demo_kasir', 'Demo Kasir', 0],
    ['demo_petugas', 'Demo Petugas', 0],
  ];

  for (const [username, name, isAdmin] of demoUsers) {
    await db.query(
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
  }

  const copiedConfig = await copyIfEmpty(db, 'config', sourceTenantId, demoTenantId, [
    'tenant_id', 'show_alert_delete', 'perusahaan', 'logo', 'telp', 'alamat', 'link_app',
    'lisensi', 'show_supplier', 'show_stok_masuk', 'show_stok_keluar', 'show_laporan_stok',
    'show_customer', 'show_ukuran', 'show_opsi_all', 'jenis_faktur', 'created_at', 'updated_at',
  ]);

  const copiedTariffs = await copyIfEmpty(db, 'level_pemakaian', sourceTenantId, demoTenantId, [
    'tenant_id', 'jenis', 'level', 'harga', 'per_pemakaian', 'per_pemakaian_max', 'created_at', 'updated_at',
  ]);

  const copiedCustomers = await copyIfEmpty(db, 'customer', sourceTenantId, demoTenantId, [
    'tenant_id', 'urut', 'nama', 'alamat', 'tipe', 'kota', 'rt', 'rw', 'telp', 'no_kk',
    'foto', 'barcode', 'tgl_daftar', 'status', 'created_at', 'updated_at', 'latitude', 'longitude',
  ]);

  const seededReadings = await seedMonthlyReadings(db, demoTenantId);

  const [summary] = await db.query(
    `SELECT
      (SELECT COUNT(*) FROM users WHERE tenant_id = ?) AS users,
      (SELECT COUNT(*) FROM customer WHERE tenant_id = ?) AS customers,
      (SELECT COUNT(*) FROM faktur WHERE tenant_id = ?) AS faktur`,
    [demoTenantId, demoTenantId, demoTenantId],
  );

  await db.end();

  console.log(JSON.stringify({
    ok: true,
    demoTenantId,
    copiedConfig,
    copiedTariffs,
    copiedCustomers,
    seededReadings,
    summary: summary[0],
  }));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
