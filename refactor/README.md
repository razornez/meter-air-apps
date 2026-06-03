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
- [ ] **Fase 5 (E6b)** — Panel admin web (frontend web terpisah)
- [ ] **Backlog (E7)** — Mode offline + sinkronisasi

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

## Menjalankan (dev)

```bash
# Backend
cd refactor/api
cp .env.example .env      # sesuaikan kredensial MySQL
npm install
npm run start:dev         # http://localhost:3000

# Mobile
cd refactor/mobile
npm install
npx expo start            # set EXPO_PUBLIC_API_URL ke IP lokal backend
```
