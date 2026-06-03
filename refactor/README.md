# Refactor Meter Air — NestJS + React Native (Expo) + MySQL

Refactor aplikasi PDAM/meter air dari **CodeIgniter 3 (PHP, server-rendered)** menjadi
arsitektur modern **API + Mobile Native**, dengan **database MySQL `pdam` tetap dipertahankan**.

> Kode lama (CodeIgniter 3) tetap utuh di root repo sebagai **referensi**. Semua kode baru
> ada di folder `refactor/`. Tidak ada tabel/data lama yang dihapus.

## Arsitektur

```
┌─────────────────────┐    HTTPS / JSON     ┌──────────────────┐    SQL (TypeORM)   ┌──────────────┐
│  React Native (Expo)│  ◄───────────────►  │   NestJS  API    │  ◄──────────────►  │ MySQL `pdam` │
│  - Login            │   Bearer JWT        │  - Auth (JWT)    │                    │  (existing)  │
│  - Scan QR meter    │                     │  - Meter reading │                    └──────────────┘
│  - Foto + input     │                     │  - Tarif/faktur  │
└─────────────────────┘                     └──────────────────┘
```

**Mobile tidak pernah konek langsung ke MySQL** — selalu lewat API NestJS (alasan: keamanan
kredensial DB + tidak ada driver MySQL di perangkat mobile).

## Stack

| Layer    | Teknologi |
|----------|-----------|
| Mobile   | React Native + Expo, expo-router, expo-camera (scan QR + foto), axios, expo-secure-store |
| Backend  | NestJS 10, TypeORM, Passport-JWT, bcrypt, class-validator |
| Database | MySQL `pdam` (tidak diubah strukturnya; entity TypeORM `synchronize: false`) |

## Keputusan penting (hasil audit kode lama)

1. **Password plaintext** di tabel `users` (mis. `123456`). Strategi: login backward-compatible —
   jika password tersimpan masih plaintext & cocok, terima lalu **auto-upgrade ke bcrypt hash**.
2. **SQL injection** di kode lama (concat string). API baru pakai query builder/parameter binding.
3. **Auth session → JWT** supaya bisa dipakai mobile native (stateless, Bearer token).
4. **CI3 EOL** — tidak dilanjutkan; hanya jadi referensi logika bisnis.

## Mapping tabel → modul

| Tabel MySQL        | Entity NestJS      | Modul     |
|--------------------|--------------------|-----------|
| `users`            | `User`             | auth      |
| `log_aktivitas`    | `ActivityLog`      | auth      |
| `customer`         | `Customer`         | meter     |
| `history_meter`    | `HistoryMeter`     | meter     |
| `level_pemakaian`  | `LevelPemakaian`   | meter     |
| `faktur`           | `Faktur`           | meter     |
| `transaksi`        | `Transaksi`        | meter     |
| `config`           | `AppConfig`        | config    |

## Logika tarif (port dari `Transaksi::getTotalbyMeter`)

`customer.tipe` (B/N/S) → `level_pemakaian.jenis`. Pemakaian (m³ = meter_baru − meter_lama)
dihitung **berjenjang/blok**: tiap level menampung `per_pemakaian` m³ dengan `harga`/m³, sisa
pemakaian melimpah ke level berikutnya; level terakhir menampung semua sisa.

## Endpoint API (fase 1: auth + meter reading)

| Method | Path | Keterangan |
|--------|------|------------|
| POST | `/auth/login` | username + password → `{ access_token, user }` |
| GET  | `/auth/me` | profil user dari token |
| GET  | `/customers/by-barcode/:barcode` | lookup pelanggan dari hasil scan QR |
| GET  | `/customers/:id/last-meter` | meter terakhir + status sudah dicatat bulan ini |
| POST | `/meter/calculate` | `{ tipe, pemakaian }` → rincian tarif berjenjang + total |
| POST | `/meter/readings` | simpan catatan meter (+ generate faktur & history) |
| POST | `/meter/readings/:noFaktur/photo` | upload foto meter |

## Urutan migrasi bertahap

- [x] **Fase 0** — Scaffolding + rencana
- [x] **Fase 1** — Auth (JWT) + Meter reading (inti lapangan) — **SELESAI & TERUJI**
  - Backend diuji end-to-end ke DB `pdam`: login, `/auth/me`, hitung tarif
    (cocok persis Rp60.000 utk tipe B/25 m³), resolve pelanggan, simpan
    catatan (faktur+history+transaksi atomik), guard duplikat (409), 401.
  - Mobile: typecheck bersih + bundle Metro sukses (826 modul).
- [x] **Fase 2** — Daftar pelanggan + riwayat meter + daftar/detail faktur — **SELESAI & TERUJI**
  - Tambah sistem dokumentasi **BMAD** + standar (SOLID/DRY/KISS) + **unit test** (28 hijau).
  - Backend diuji ke DB: list+search pelanggan, riwayat pemakaian, faktur (3326 baris).
  - Mobile: 4 layar baru, bundle 831 modul. Detail di `docs/sprints/sprint-02-review.md`.
- [x] **Fase 3** — Pelunasan tagihan + cetak/kirim faktur PDF — **SELESAI & TERUJI**
  - API config perusahaan + pelunasan (set/batal lunas, atomik + audit log).
  - Mobile: tombol Tandai/Batal Lunas + cetak/bagikan PDF (expo-print/sharing).
  - 31 unit test hijau; bundle 838 modul. Detail di `docs/sprints/sprint-03-review.md`.
- [x] **Fase 4** — Laporan/rekap + master data (produk/supplier) — **SELESAI & TERUJI**
  - API `/reports/summary` & `/reports/monthly`, `/produk`, `/supplier`.
  - Mobile: layar Laporan (KPI + rekap 6 bulan) & Master Data (Produk/Supplier).
  - **Stack di-upgrade NestJS 10→11** (config4/typeorm11/jwt11/class-validator0.15/bcryptjs3),
    sampah template dibersihkan. 33 unit test hijau; bundle 840 modul.
  - Detail di `docs/sprints/sprint-04-review.md`.
- [x] **Utang teknis** — **TD-6** unit test mobile (jest-expo, 7 test) ✅ ·
  **TD-7** panel admin web (dibuat user di `htdocs/meter-air`) ✅ ·
  **TD-5** tabel `pembayaran` (entity + migrasi + recording best-effort + endpoint
  `GET /faktur/payments`) ✅ — **jalankan migrasi untuk mengaktifkan**:
  `mysql -u root pdam < refactor/api/migrations/001_create_pembayaran.sql`
- [x] **Fase 5 (E7)** — Mode offline + sinkronisasi pencatatan meter — **SELESAI & TERUJI**
  - Antrian lokal (AsyncStorage) + auto-enqueue saat offline + auto-sync saat online
    (NetInfo); idempoten via guard 409. Tabel `pembayaran` (TD-5) **sudah dimigrasi & live**.
  - 17 unit test mobile; bundle 859 modul. Detail di `docs/sprints/sprint-05-review.md`.
- [x] **E7b** — Lookup pelanggan offline (cache) — **SELESAI & TERUJI**
  - API `GET /customers/snapshot` + cache mobile (AsyncStorage) + fallback scan/cari
    saat offline. 37 test backend, 24 test mobile.
- [x] **E8** — Peta Konsumen (Leaflet + OSM) — **SELESAI & TERUJI**
  - Marker pelanggan berwarna status bayar (hijau=lunas/merah=belum/abu=tanpa tagihan),
    admin atur titik via peta. `GET /customers/map` + `PATCH /:id/location`.
  - 41 test backend, 28 test mobile. Lintas-platform (web iframe / native webview).
- [x] **E9** — Deteksi Anomali Konsumsi (rule-based, gratis) — **SELESAI & TERUJI**
  - `GET /reports/anomalies` deteksi lonjakan(bocor)/nol(meter rusak)/turun; layar Anomali.
  - Menemukan kasus nyata (rasio puluhan kali). 48 test backend, 28 mobile. Latensi 15ms.
- [x] **E10** — Worklist Pencatatan (alat harian petugas) — **SELESAI & TERUJI**
  - `GET /reports/worklist` progres (done/total) + daftar belum dicatat; tap → langsung catat.
  - 51 test backend, 28 mobile. Latensi 9ms.
- [x] **E11 + E8b** — Tunggakan+Denda + GPS Otomatis — **SELESAI & TERUJI** *(Sprint 10)*
  - `GET /reports/tunggakan` (600 pelanggan, Rp93,9jt tagihan + Rp10,6jt denda, 9ms).
  - GPS: tombol GPS di SetLocation + banner GPS saat catat (best-effort, tidak blok).
  - 55 test backend, 28 mobile. Semua endpoint < 1s.
- [ ] **Backlog (untuk PETUGAS)** — Rekap kinerja pencatatan · pembayaran QRIS · WhatsApp · OCR meter

## Test (guardrail)

```bash
cd refactor/api    && npm test   # 37 unit test (logika bisnis backend)
cd refactor/mobile && npm test   # 24 unit test (util + offline antrian/sync/cache)
cd refactor/api    && npm run perf  # guardrail performa: tiap endpoint < 1 detik
```

Hasil performa terukur (semua ≤ ~13 ms): [refactor/PERFORMANCE.md](refactor/PERFORMANCE.md).

> **Proses kerja & standar** ada di `refactor/docs/` (PRD, arsitektur, coding/testing
> standards, Definition of Done, sprint & story). Lihat `docs/README.md`.

## Status verifikasi Fase 1

| Uji | Hasil |
|-----|-------|
| `POST /auth/login` (admin/123456, password plaintext lama) | ✅ JWT + profil |
| `GET /auth/me` (Bearer) | ✅ profil; tanpa token → 401 |
| `POST /meter/calculate` tipe B, 25 m³ | ✅ Rp60.000 (blok 1:10, 2:10, 3:5) |
| `GET /customers/resolve/:id` | ✅ info pelanggan + meter terakhir |
| `POST /meter/readings` | ✅ faktur `FA/BD/26/06/xxxx`, total = subtotal + beban 5.000 |
| Simpan ulang bulan sama | ✅ 409 Conflict |
| Mobile bundle (Metro) | ✅ 826 modul, tanpa error |

## Menjalankan (dev) — AUTO-RELOAD

> Kedua perintah di bawah **otomatis reload saat kode berubah** — TIDAK perlu
> restart manual. Backend pakai `start:dev` (nest watch), Mobile pakai Fast Refresh.
> **Jangan** pakai `node dist/main` untuk dev (itu tidak auto-reload).

**Cara cepat (Windows, 1 klik — buka 2 terminal otomatis):**

```powershell
cd refactor
powershell -ExecutionPolicy Bypass -File .\dev.ps1
```

**Atau manual (2 terminal terpisah):**

```bash
# Terminal 1 — Backend (auto-recompile + restart tiap file berubah)
cd refactor/api
cp .env.example .env        # set PORT=4000, kredensial MySQL
npm install
npm run start:dev           # http://localhost:4000/api

# Terminal 2 — Mobile (Fast Refresh: perubahan langsung tampil)
cd refactor/mobile
npm install
npx expo start              # tekan 'w' utk web; .env: EXPO_PUBLIC_API_URL=http://localhost:4000/api
```

> Catatan: perubahan file **`.env`** perlu restart manual (Ctrl+C lalu jalankan lagi
> `--clear` untuk Expo). Perubahan **kode** tidak perlu.
