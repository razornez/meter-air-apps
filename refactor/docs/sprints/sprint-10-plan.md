# Sprint 10 — Plan

**Tema:** Tunggakan + Denda (E11) + GPS Otomatis saat Catat (E8b)
**Tujuan sprint:** Petugas punya **alat penagihan** (siapa nunggak berapa) dan saat
mencatat meter bisa **mengisi koordinat pelanggan otomatis dari GPS HP**.

## Backlog sprint

| Story | Judul | Epic | Est | Status |
|-------|-------|------|-----|--------|
| **S10-00** | API `GET /reports/tunggakan` (per pelanggan, denda, hari telat) + util + test | E11 | M | ✅ Done |
| **S10-01** | Mobile `TunggakanScreen` (daftar + total denda, tap→faktur) + kartu Home | E11 | M | ✅ Done |
| **S10-02** | GPS: install expo-location + tombol GPS di `SetLocationScreen` | E8b | S | ✅ Done |
| **S10-03** | GPS: hint "Tandai lokasi saat catat" di `ReadingScreen` | E8b | S | ✅ Done |

> Sprint **selesai**. Bukti uji & retrospektif: `sprint-10-review.md`.

## Desain Tunggakan

- **Grup per pelanggan** (multi-faktur → 1 baris ringkas).
- Kolom `denda` dari DB sudah terisi (Rp5.000 flat/faktur dari sistem lama).
- Tampil: nama, jumlah faktur tunggak, total tagihan, total denda tercatat,
  grand total (tagihan + denda), hari telat terlama.
- Urut dari **grand total terbesar**.
- Tap → daftar faktur pelanggan (`FakturList` filter customerId).

## Desain GPS Otomatis

- `expo-location` `getCurrentPositionAsync` → isi `latitude`/`longitude`.
- **`SetLocationScreen`**: tombol "📍 Gunakan GPS saat ini" (quick fill, tetap bisa
  koreksi di peta). Petugas bisa pakai tanpa tap peta.
- **`ReadingScreen`**: saat pelanggan **belum punya koordinat** → tampil banner
  "📍 Tandai lokasi sekarang?" → satu ketuk → ambil GPS → kirim `PATCH /:id/location`
  atomik dengan simpan meter (background, tidak blok alur catat).

## Penutup

Hasil & bukti uji: `sprint-10-review.md`.
