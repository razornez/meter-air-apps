# Panduan Operasional — Meter Air Apps

Dokumen ini berisi cara mengelola aplikasi yang sudah berjalan di production.

---

## Arsitektur Production

```
Expo Go / APK (HP Petugas)
        │
        ▼ HTTPS
Railway NestJS API  ──▶  Railway MySQL
        │
        ▼ (opsional)
Vercel (Web Frontend)
```

---

## 1. Akses Railway Dashboard

- URL: https://railway.app
- Login dengan akun GitHub yang sudah didaftarkan

**Service yang ada:**
| Service | Fungsi |
|---|---|
| `meter-air-apps` | NestJS API (backend) |
| `MySQL` | Database |

---

## 2. Koneksi ke Database Railway MySQL

### Cara dapat credentials
1. Buka Railway → project → klik service **MySQL**
2. Klik tab **"Connect"**
3. Tab **"Public Network"** → klik **"show"** untuk lihat password
4. Copy credentials dari **Connection URL** atau **Raw mysql command**

### Koneksi via TablePlus (GUI — direkomendasikan)
Download: https://tableplus.com (gratis untuk basic)

```
Host     : <dari Railway dashboard MySQL → Connect>
Port     : <dari Railway dashboard>
User     : root
Password : <klik "show" di Railway dashboard>
Database : railway
```

### Koneksi via Script Node.js (untuk update data cepat)
```cmd
cd C:\xampp\htdocs\meter-air-apps\refactor\api

node -e "
const mysql = require('mysql2/promise');
mysql.createConnection({
  host:'<HOST>', port:<PORT>, user:'root',
  password:'<PASSWORD>', database:'railway',
  ssl:{rejectUnauthorized:false}
}).then(async c => {
  const [rows] = await c.query('SELECT * FROM payment_method');
  console.log(rows);
  c.end();
});
"
```

---

## 3. Update Data Master (Rekening, Tarif, dll)

### Ubah nama/nomor rekening pembayaran
```sql
UPDATE payment_method 
SET account_number = '0812-XXXX-XXXX',
    account_name   = 'Nama Pemilik Asli'
WHERE code = 'gopay';
```

Kode yang tersedia: `gopay`, `ovo`, `dana`, `shopeepay`, `bank_bca`, `bank_mandiri`, `bank_bni`, `bank_bri`, `midtrans`

### Ubah nama/info perusahaan
```sql
UPDATE config 
SET perusahaan = 'Nama Perusahaan Baru',
    telp       = '08XX-XXXX-XXXX',
    alamat     = 'Alamat Lengkap'
WHERE tenant_id = 1;
```

### Ubah tarif air
```sql
-- Lihat tarif saat ini
SELECT * FROM level_pemakaian WHERE tenant_id = 1 ORDER BY jenis, level;

-- Ubah harga per level
UPDATE level_pemakaian SET harga = 3500 WHERE jenis = 'B' AND level = 2;
```

---

## 4. Deploy Ulang (setelah ada perubahan kode)

Railway otomatis redeploy setiap kali ada **push ke branch `main`**.

```cmd
cd C:\xampp\htdocs\meter-air-apps
git add .
git commit -m "pesan perubahan"
git push origin main
```

Pantau progress build di Railway dashboard → service → tab **"Deployments"**.

---

## 5. Generate APK Android

### Syarat
- Punya akun di https://expo.dev (gratis)
- EAS CLI terinstall: `npm install -g eas-cli`

### Langkah
```cmd
cd C:\xampp\htdocs\meter-air-apps\refactor\mobile

# Login ke Expo
eas login

# Inisialisasi (hanya pertama kali)
eas build:configure

# Build APK (untuk testing / distribusi langsung ke HP)
eas build --platform android --profile preview
```

Setelah selesai (~10-15 menit), Expo kirim link download APK via email/dashboard.

**Install APK ke HP:**
1. Download APK dari link Expo
2. Kirim ke HP via WhatsApp / Google Drive
3. Buka file APK di HP → install (aktifkan "Install dari sumber tidak dikenal" dulu di Pengaturan)

---

## 6. Tambah Tenant Baru (untuk PDAM/BUMDes lain)

```sql
INSERT INTO tenants (nama, slug, kode, token, status, expired_at, grace_period_days)
VALUES (
  'Nama PDAM/BUMDes',
  'slug-unik',         -- huruf kecil, tanpa spasi, contoh: pdam-bandung
  'KODE-LOGIN',        -- kode yang dipakai saat login, contoh: PDAM-BDG
  UUID(),              -- auto generate UUID
  'aktif',
  '2027-12-31 00:00:00',
  7
);

-- Tambah user untuk tenant baru
INSERT INTO users (tenant_id, username, name, password, is_active, is_admin)
VALUES (
  LAST_INSERT_ID(),    -- id tenant yang baru dibuat
  'admin',
  'Nama Admin',
  '$2a$10$...',        -- password bcrypt (generate via: https://bcrypt-generator.com)
  1,
  1
);
```

---

## 7. Login Aplikasi

| Field | Value |
|---|---|
| Kode Perusahaan | `BUMDES-KRK` |
| Username | `admin` |
| Password | (sesuai data di database) |

---

## 8. Environment Variables Penting

Semua env vars diset di Railway dashboard → service NestJS → tab **"Variables"**:

| Variable | Keterangan |
|---|---|
| `DB_HOST` | Auto-link dari MySQL service |
| `JWT_SECRET` | Wajib diganti dengan string random panjang |
| `MIDTRANS_SERVER_KEY` | Dari dashboard Midtrans |
| `MIDTRANS_IS_PRODUCTION` | `true` untuk production |
| `AUTH_UPGRADE_PLAINTEXT` | `false` (jangan ubah) |

---

## 9. Import Database ke Railway (bila perlu reset)

```cmd
cd C:\xampp\htdocs\meter-air-apps\refactor\api

node import-db.js <HOST> <PORT> root <PASSWORD> railway
```

File backup: `refactor/api/meterair_backup.sql`  
Untuk buat backup baru: `mysqldump` dari Railway atau export via TablePlus.

---

## 10. Troubleshooting Umum

| Masalah | Solusi |
|---|---|
| App tidak bisa login | Cek `EXPO_PUBLIC_API_URL` di `refactor/mobile/.env` |
| API error 500 | Cek logs di Railway → service → tab "Logs" |
| Data tidak update | Pastikan update di Railway MySQL, bukan XAMPP lokal |
| Expo Go tidak refresh | `npx expo start --clear` lalu scan ulang QR |
| Deploy gagal | Cek build logs di Railway → Deployments |
| Database kosong | Jalankan `node import-db.js ...` ulang |
