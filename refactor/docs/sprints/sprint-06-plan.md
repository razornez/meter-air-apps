# Sprint 6 — Plan (rencana)

**Tema:** Lookup pelanggan offline (E7b) — melengkapi E7
**Tujuan sprint:** Petugas dapat **scan/cari pelanggan & lihat meter terakhir tanpa
sinyal**. Saat ini (E7) antrian *tulis* sudah offline; *baca* pelanggan masih perlu
koneksi → ini melengkapinya.

## Sasaran (Sprint Goal)

> "Di lapangan tanpa jaringan, saya bisa scan QR / cari pelanggan, melihat data &
> meter terakhirnya, lalu mencatat — semuanya dari cache lokal."

## Backlog (draft)

| Story | Judul | Epic | Est | Status |
|-------|-------|------|-----|--------|
| **S6-00** | API: endpoint snapshot pelanggan (bulk/chunk) untuk cache | E7b | M | Draft |
| **S6-01** | Mobile: simpan & segarkan cache pelanggan (expo-sqlite) | E7b | L | Draft |
| **S6-02** | Mobile: resolve/cari & meter info dari cache saat offline | E7b | M | Draft |

## Pendekatan teknis (usulan)

- **Backend:** `GET /customers/snapshot?page=&limit=` ringkas (id, nama, alamat, tipe,
  barcode, lastMeter) untuk diunduh & disimpan. 658 baris → unduh berhalaman.
- **Storage:** **`expo-sqlite`** (lebih tepat dari AsyncStorage untuk ratusan baris +
  query cari/by-barcode).
- **Strategi baca:** online → API seperti biasa & segarkan cache; offline → baca dari
  SQLite. `alreadyRecordedThisMonth` offline = cek snapshot + **antrian lokal** (E7).
- **Refresh:** otomatis saat app dibuka & online; indikator "terakhir disinkron".

## Risiko / catatan

- `expo-sqlite` di SDK 56 (API baru `openDatabaseAsync`) — verifikasi versi.
- Konsistensi: data cache bisa basi; tampilkan waktu sinkron terakhir.
- Ukuran: 658 pelanggan ringan; bila tumbuh besar, pertimbangkan sinkron inkremental
  (`?since=`).

## Definisi selesai

Mengikuti `standards/definition-of-done.md` — termasuk unit test untuk logika cache
(murni, storage di-inject) seperti pola E7.

## Alternatif/urutan

Bila lebih prioritas, bisa juga: hardening keamanan (rotasi `JWT_SECRET`, hash semua
password lama via `AUTH_UPGRADE_PLAINTEXT`), atau iterasi panel admin web. Lihat
`prd.md` untuk peta epik.
