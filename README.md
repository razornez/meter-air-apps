# Meter Air — Aplikasi PDAM

Sistem pencatatan meter air & penagihan PDAM. Repo ini berisi:

- **`refactor/`** — stack modern hasil refactor:
  - `refactor/api` — **Backend API** (NestJS 11 + TypeORM, MySQL `pdam`)
  - `refactor/mobile` — **Aplikasi mobile** petugas (React Native + Expo SDK 56)
  - `refactor/docs` — dokumentasi proses (BMAD): PRD, arsitektur, standar, sprint
- **Root (`application/`, `system/`, dll.)** — aplikasi lama (CodeIgniter 3) sebagai
  referensi. Panel admin web ada di `htdocs/meter-air`.

> 🔐 **Semua key & credential disimpan di environment variables**, tidak di kode.
> Lihat [`refactor/DEPLOYMENT.md`](refactor/DEPLOYMENT.md). File `.env` di-gitignore.

## Prasyarat

- **Node.js 20+** (disarankan ≥ 20.19.4 untuk Expo)
- **MySQL** (XAMPP) dengan database **`pdam`**
- **Expo Go** di HP, atau emulator Android/iOS

## 1) Menjalankan Backend API

```bash
cd refactor/api
cp .env.example .env          # isi kredensial MySQL & JWT_SECRET
#   penting: port 3000 & 3001 dipakai app lain di mesin dev → set PORT=4000
npm install
npm run start:dev             # → http://localhost:4000/api
```

Aktifkan riwayat pembayaran (sekali, sudah dijalankan di mesin dev):

```bash
mysql -u root pdam < refactor/api/migrations/001_create_pembayaran.sql
```

## 2) Menjalankan Mobile

```bash
cd refactor/mobile
npm install
# arahkan ke API: buat mobile/.env berisi
#   EXPO_PUBLIC_API_URL=http://<IP-LAN-PC>:4000/api   (emulator: http://10.0.2.2:4000/api)
npx expo start                # scan QR via Expo Go, atau tekan 'a' (emulator)
```

Akun untuk login uji ada di `refactor/TEST-USERS.md` (file lokal, tidak di-commit).

## 3) Panel admin web & app lama

Ada di `htdocs/meter-air` (CodeIgniter) — diakses via XAMPP Apache
(`http://localhost/meter-air`).

## Test (guardrail QA)

```bash
cd refactor/api    && npm test   # 35 unit test (logika bisnis backend)
cd refactor/mobile && npm test   # 17 unit test (util + antrian/sync offline)
```

## Fitur (ringkas)

Auth JWT · scan QR meter · input meter + tarif berjenjang · faktur · pelunasan +
riwayat pembayaran · cetak/bagikan PDF · daftar pelanggan + riwayat pemakaian ·
laporan/rekap · master data · **mode offline + sinkronisasi**.

## Dokumentasi

- Proses kerja & standar: [`refactor/docs/README.md`](refactor/docs/README.md)
- Arsitektur & keputusan (ADR): [`refactor/docs/architecture/architecture.md`](refactor/docs/architecture/architecture.md)
- Deployment & env: [`refactor/DEPLOYMENT.md`](refactor/DEPLOYMENT.md)
- Detail refactor: [`refactor/README.md`](refactor/README.md)
