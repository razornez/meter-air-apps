# Arsitektur Teknis — Meter Air

**Pemilik:** Architect · **Status:** hidup

## 1. Gambaran

```
React Native (Expo)  ──HTTPS/JSON, Bearer JWT──►  NestJS API  ──TypeORM──►  MySQL `pdam`
   (petugas)                                       (stateless)               (existing)
```

- **Mobile** = lapisan presentasi murni; tidak ada akses DB langsung.
- **API** = satu-satunya pintu ke DB; berisi seluruh aturan bisnis.
- **MySQL** = sumber data lama yang dipertahankan apa adanya.

## 2. Struktur backend (NestJS)

Modular by-feature. Tiap modul: `*.module.ts`, `*.controller.ts`, `*.service.ts`,
`entities/`, `dto/`. Aturan bisnis **selalu di service**, controller tipis.

```
api/src/
├── auth/        # E1 — JWT, guard, strategy
├── customers/   # E3 — pelanggan, riwayat meter
├── meter/       # E2 — tarif, faktur, transaksi (pencatatan)
├── faktur/      # E4 — daftar & detail tagihan (Sprint 2)
└── common/      # guard, decorator, util lintas modul
```

## 3. Konvensi data

- Entity map ke tabel lama (nama kolom snake_case lewat opsi `name`).
- Tipe kolom **eksplisit** untuk field nullable (hindari error inferensi TypeORM).
- Query memakai Query Builder/Repository (parameter binding) — **tidak ada** string
  concatenation SQL.

## 4. Keputusan Arsitektur (ADR)

### ADR-001 — Stack NestJS + Expo, MySQL dipertahankan
**Konteks:** refactor app PDAM CI3. **Keputusan:** API NestJS (TypeScript) + mobile
Expo, reuse MySQL `pdam`. **Alasan:** satu bahasa (TS) lintas tim, ekosistem modern,
tanpa migrasi data berisiko. **Konsekuensi:** perlu lapisan API baru (tidak ada
sebelumnya).

### ADR-002 — Auth backward-compatible (plaintext → bcrypt)
**Konteks:** `users.password` tersimpan plaintext; app CI3 lama masih jalan paralel.
**Keputusan:** verifikasi plaintext lama diterima; rehash bcrypt **opsional** via flag
`AUTH_UPGRADE_PLAINTEXT` (default off). **Alasan:** menyalakan rehash langsung akan
memutus login app lama. **Konsekuensi:** nyalakan flag saat cutover, lalu pensiunkan
app lama.

### ADR-003 — Resolusi scan fleksibel
**Konteks:** `customer.barcode` mayoritas kosong. **Keputusan:** endpoint `resolve`
coba barcode → fallback id numerik. **Konsekuensi:** scan tetap berfungsi; QR fisik
sebaiknya mengkodekan id pelanggan.

### ADR-007 — Tabel `pembayaran` + recording best-effort (TD-5)
**Konteks:** ADR-005 menunda riwayat pembayaran granular. **Keputusan:** tambah tabel
`pembayaran` (aditif, via `migrations/001_create_pembayaran.sql`); `setLunas` mencatat
ke tabel ini **best-effort** (di luar transaksi inti, gagal → hanya warning) supaya
pelunasan tetap jalan walau migrasi belum diterapkan. Endpoint `GET /faktur/payments`
mengembalikan `[]` bila tabel belum ada. **Alasan:** memungkinkan rollout bertahap
tanpa memutus fitur pelunasan yang sudah berjalan. **Konsekuensi:** jalankan migrasi
saat deploy agar riwayat tersimpan; setelah migrasi, recording aktif otomatis.

### ADR-005 — Pelunasan tanpa tabel baru (sementara)
**Konteks:** E5 butuh status lunas; skema lama tak punya tabel pembayaran.
**Keputusan:** pelunasan memakai `faktur.is_lunas` + `transaksi.dibayar`; audit ke
`log_aktivitas`. **Alasan:** tidak mengubah skema, cukup untuk kebutuhan status.
**Konsekuensi:** riwayat pembayaran granular (jumlah/metode/waktu) belum ada → perlu
tabel `pembayaran` via migrasi pada fase lanjutan.

### ADR-006 — PDF faktur dibuat di sisi mobile
**Konteks:** perlu cetak/kirim faktur. **Keputusan:** render HTML→PDF di aplikasi
(`expo-print`) lalu bagikan (`expo-sharing`), bukan server-side. **Alasan:** hindari
dependensi berat (puppeteer) di server; idiomatik Expo; bisa cetak/kirim langsung dari
HP petugas. **Konsekuensi:** template faktur ada di mobile; API cukup menyediakan data.

### ADR-004 — Pagination berbasis page/limit
**Konteks:** daftar pelanggan & faktur bisa besar. **Keputusan:** standar respons
list = `{ data, total, page, limit }`, default `limit=20`. **Alasan:** sederhana,
cukup untuk volume saat ini (ratusan–ribuan baris). **Konsekuensi:** bila tumbuh
sangat besar, pertimbangkan keyset pagination.

## 5. Keamanan

- Semua endpoint (kecuali `/auth/login`) di belakang `JwtAuthGuard`.
- Validasi input via `class-validator` + `ValidationPipe(whitelist,transform)`.
- Tidak menaruh kredensial DB di mobile; secret JWT via env.

## 6. Pengujian (ringkas — detail di standards/testing-standards.md)

- Unit test wajib untuk service berisi logika bisnis (tarif, faktur, auth).
- Test piramida: banyak unit, sedikit e2e pada alur kritis.
