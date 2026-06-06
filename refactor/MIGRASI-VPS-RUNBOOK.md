# Runbook Migrasi ke VPS — Meter Air

Tujuan: web admin (Laravel) + API mobile (NestJS) + MySQL jadi **satu** di VPS,
berbagi **satu database** (`meterair`). Domain API mobile: `api.meterair.id`.

Ganti yang HURUF BESAR: `IP_VPS`, `USER_VPS`, `DB_USER`, `DB_PASS`, `DB_NAME`.

---

## Prasyarat (sekali)

1. **DNS:** di pengelola domain meterair.id, tambah record:
   `A   api   ->  IP_VPS`   (tunggu propagasi ~5–30 menit)
2. **Push kode terbaru** (dari laptop) supaya VPS bisa tarik:
   ```bash
   # repo web admin (ada migrasi meter_photo baru)
   cd /c/xampp/htdocs/meter-air && git add -A && git commit -m "feat(db): migrasi meter_photo" && git push

   # repo mobile+api (semua perubahan terbaru: foto BLOB, audit, dll)
   cd /c/xampp/htdocs/meter-air-apps && git add -A && git commit -m "feat: foto BLOB, audit trail, kompres, config VPS" && git push
   ```

---

## STEP 1 — Backup database TERBARU (di laptop)

```bash
# Dump segar langsung dari MySQL XAMPP (paling update)
"C:\xampp\mysql\bin\mysqldump.exe" -u root meterair > "%USERPROFILE%\Desktop\meterair_migrasi.sql"
```
> Kalau lebih suka pakai file yang sudah ada:
> `c:\xampp\htdocs\meter-air\storage\app\backups\meterair_LOCAL_2026-06-06.sql`

---

## STEP 2 — Kirim backup ke VPS (di laptop)

```bash
scp "%USERPROFILE%\Desktop\meterair_migrasi.sql" USER_VPS@IP_VPS:/tmp/meterair.sql
```

---

## STEP 3 — Import database (di VPS, via SSH)

```bash
ssh USER_VPS@IP_VPS

# Cek dulu DB web admin (nama/user dari .env web admin)
cat /var/www/meter-air/.env | grep DB_

# Cek apakah sudah ada data bisnis (harusnya 0 / error)
mysql -u DB_USER -p DB_NAME -e "SELECT COUNT(*) FROM customer;" 2>&1

# Import (akan replace tabel dengan data lokal — aman karena VPS belum ada data bisnis)
mysql -u DB_USER -p DB_NAME < /tmp/meterair.sql

# Verifikasi
mysql -u DB_USER -p DB_NAME -e "SELECT (SELECT COUNT(*) FROM customer) AS cust, (SELECT COUNT(*) FROM faktur) AS faktur, (SELECT COUNT(*) FROM meter_photo) AS foto;"
```
Hasil yang diharapkan: `cust=658, faktur=3330, foto=0`.

---

## STEP 4 — Sinkron migrasi Laravel + bersihkan cache (di VPS)

```bash
cd /var/www/meter-air
git pull
php artisan migrate --force      # mencatat migrasi meter_photo (tabel sudah ada → aman)
php artisan optimize:clear
```

---

## STEP 5 — Deploy API NestJS (di VPS)

```bash
# Node.js 20 (lewati bila sudah ada)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

# Ambil kode API
sudo mkdir -p /var/www/meter-air-api && sudo chown $USER:$USER /var/www/meter-air-api
git clone https://github.com/razornez/meter-air-apps.git /tmp/mair
cp -r /tmp/mair/refactor/api/* /var/www/meter-air-api/
cd /var/www/meter-air-api

# Dependencies + build
npm install
npm run build

# Konfigurasi
cp .env.production.example .env
nano .env     # isi DB_*, JWT_SECRET (openssl rand -base64 48), Midtrans

# Folder log
sudo mkdir -p /var/log/meter-air-api && sudo chown $USER:$USER /var/log/meter-air-api
```

---

## STEP 6 — Jalankan API dengan PM2 (di VPS)

```bash
cd /var/www/meter-air-api
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup     # jalankan perintah yang muncul (agar auto-start saat VPS reboot)

# Cek jalan di port 4000
curl http://127.0.0.1:4000/api/health
```
Harus balas: `{"status":"ok","db":"ok",...}`

---

## STEP 7 — nginx reverse proxy (di VPS)

```bash
sudo nano /etc/nginx/sites-available/api.meterair.id
```
Isi:
```nginx
server {
    listen 80;
    server_name api.meterair.id;

    client_max_body_size 12M;   # untuk upload foto meter

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Aktifkan:
```bash
sudo ln -s /etc/nginx/sites-available/api.meterair.id /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## STEP 8 — SSL HTTPS (di VPS)

```bash
sudo certbot --nginx -d api.meterair.id
```
Pilih redirect HTTP→HTTPS bila ditanya.

Verifikasi dari mana saja:
```bash
curl https://api.meterair.id/api/health
```

---

## STEP 9 — Rebuild APK (di laptop)

`eas.json` sudah diarahkan ke `https://api.meterair.id/api`.
```bash
cd /c/xampp/htdocs/meter-air-apps/refactor/mobile
eas build --profile preview --platform android
```
Install APK baru → aplikasi konek ke VPS.

---

## STEP 10 — Bereskan (opsional)

- Pastikan `SEED_SECRET` di `.env` VPS **kosong** (matikan endpoint seed di produksi).
- Matikan layanan Railway (sudah tidak dipakai).
- Cron auto-cleanup data demo tetap jalan harian (aman, hanya hapus `SED/%`).

---

## Verifikasi akhir (checklist)

- [ ] `https://api.meterair.id/api/health` → `db:ok`
- [ ] Login di APK baru berhasil (akun dari data lokal)
- [ ] Catat meter + foto → muncul di riwayat (foto dari DB)
- [ ] Web admin VPS tampil data sama (658 pelanggan)
- [ ] Cetak/bagikan PDF jalan
