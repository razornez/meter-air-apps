# Runbook Migrasi ke VPS — Meter Air (API mobile NestJS)

Tujuan: API mobile NestJS jadi satu di VPS yang sama dengan web admin Laravel,
**berbagi database `meterair` yang sama**. Konsisten dgn pola web admin
(systemd + GitHub Actions auto-deploy).

- Web admin (Laravel) : `https://meterair.online`  → `/var/www/meter-air`
- API mobile (NestJS) : `https://api.meterair.online` → `/var/www/meter-air-api`
- Database (sama)     : `meterair` / user `meterair_user` / localhost / utf8mb4

Ganti yang HURUF BESAR: `IP_VPS`, `USER_VPS`, `DB_PASS`.

---

## Prasyarat (sekali)

1. **DNS:** tambah record `A   api.meterair.online  ->  IP_VPS`
2. **GitHub Secrets** di repo `meter-air-apps` (Settings → Secrets → Actions):
   `DEPLOY_HOST=IP_VPS`, `DEPLOY_USER=USER_VPS`, `DEPLOY_KEY=<private key SSH>`
3. Di VPS, beri user deploy sudo tanpa password untuk restart service:
   ```bash
   echo "USER_VPS ALL=(ALL) NOPASSWD: /bin/systemctl restart meter-air-api" | sudo tee /etc/sudoers.d/meter-air-api
   ```

---

## STEP 1 — Import database (sumber: backup lokal terbaru)

**Di laptop** — dump segar + kirim:
```bash
"C:\xampp\mysql\bin\mysqldump.exe" -u root meterair > "%USERPROFILE%\Desktop\meterair.sql"
scp "%USERPROFILE%\Desktop\meterair.sql" USER_VPS@IP_VPS:/tmp/meterair.sql
```

**Di VPS** — cek kosong lalu import:
```bash
ssh USER_VPS@IP_VPS
# Cek (harus 0 / error "doesn't exist")
mysql -u meterair_user -p meterair -e "SELECT COUNT(*) FROM customer;" 2>&1
# Import
mysql -u meterair_user -p meterair < /tmp/meterair.sql
# Verifikasi
mysql -u meterair_user -p meterair -e "SELECT (SELECT COUNT(*) FROM customer) cust,(SELECT COUNT(*) FROM faktur) faktur,(SELECT COUNT(*) FROM meter_photo) foto;"
```
Harapan: `cust=658, faktur=3330, foto=0`.

---

## STEP 2 — Sinkron migrasi web admin (di VPS)

```bash
cd /var/www/meter-air && git pull origin main
php artisan migrate --force      # mencatat migrasi meter_photo (tabel sudah ada → aman)
php artisan optimize:clear
```

---

## STEP 3 — Siapkan API NestJS (di VPS, sekali)

```bash
# Node.js 20 + git (lewati bila sudah ada)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git

# Clone repo (seluruh meter-air-apps; API ada di refactor/api)
sudo mkdir -p /var/www/meter-air-api && sudo chown $USER:$USER /var/www/meter-air-api
git clone https://github.com/razornez/meter-air-apps.git /var/www/meter-air-api
cd /var/www/meter-air-api/refactor/api

# Dependencies + build
npm ci
npm run build

# Konfigurasi .env (DB sama dengan web admin)
cp .env.production.example .env
nano .env
#   DB_DATABASE=meterair  DB_USERNAME=meterair_user  DB_PASSWORD=DB_PASS
#   JWT_SECRET=$(openssl rand -base64 48)   ← isi
#   Midtrans SERVER/CLIENT key, SEED_SECRET dikosongkan
#   DB_CHARSET=utf8mb4 (default — biarkan)

# Folder log
sudo mkdir -p /var/log/meter-air-api && sudo chown www-data:www-data /var/log/meter-air-api
```

---

## STEP 4 — Jalankan via systemd (di VPS)

```bash
sudo cp /var/www/meter-air-api/refactor/api/deploy/meter-air-api.service /etc/systemd/system/
# (sesuaikan User= di file bila pemilik folder bukan www-data)
sudo chown -R www-data:www-data /var/www/meter-air-api
sudo systemctl daemon-reload
sudo systemctl enable --now meter-air-api

# Cek jalan di port 4000
curl http://127.0.0.1:4000/api/health     # → {"status":"ok","db":"ok",...}
sudo systemctl status meter-air-api --no-pager
```

---

## STEP 5 — nginx + SSL untuk api.meterair.online (di VPS)

```bash
sudo nano /etc/nginx/sites-available/api.meterair.online
```
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name api.meterair.online;

    client_max_body_size 20M;   # samakan web admin (upload foto)

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
```bash
sudo ln -s /etc/nginx/sites-available/api.meterair.online /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d api.meterair.online      # SSL (pilih redirect HTTPS)

# Verifikasi publik
curl https://api.meterair.online/api/health
```

---

## STEP 6 — Auto-deploy aktif

Workflow `.github/workflows/deploy-api.yml` sudah ada. Mulai sekarang:
**push ke `main` yang menyentuh `refactor/api/**` → otomatis deploy** (git pull, npm ci,
build, restart systemd). Sama persis pola web admin.

---

## STEP 7 — Rebuild APK (di laptop)

`eas.json` sudah → `https://api.meterair.online/api`.
```bash
cd /c/xampp/htdocs/meter-air-apps/refactor/mobile
eas build --profile preview --platform android
```

---

## STEP 8 — Bereskan

- Pastikan `SEED_SECRET` di `.env` VPS **kosong** (matikan endpoint seed).
- Matikan Railway (tidak dipakai lagi).
- Cron auto-cleanup data demo jalan harian (hanya hapus `SED/%`).

---

## Verifikasi akhir

- [ ] `https://api.meterair.online/api/health` → `db:ok`
- [ ] Login APK baru berhasil
- [ ] Catat meter + foto → muncul di riwayat (foto dari DB)
- [ ] Nama pelanggan karakter khusus tampil benar (charset utf8mb4)
- [ ] Web admin & mobile lihat data sama (658 pelanggan)
