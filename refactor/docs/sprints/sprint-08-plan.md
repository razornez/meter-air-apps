# Sprint 8 — Plan

**Tema:** Deteksi Anomali Konsumsi (E9) — killer feature gratis
**Tujuan sprint:** Otomatis menandai pelanggan dengan pola pemakaian janggal (bocor,
meter rusak/tampering, turun drastis) agar bisa diverifikasi petugas.

## Sasaran (Sprint Goal)

> "Dari satu daftar, saya lihat pelanggan yang pemakaiannya tidak wajar bulan ini
> beserta alasannya — tanpa biaya, dari data yang sudah ada."

## Aturan deteksi (rule-based, murni)

Membandingkan pemakaian **terakhir** vs rata-rata beberapa periode sebelumnya:

| Tipe | Kondisi | Arti | Severity |
|------|---------|------|----------|
| **lonjakan** | terakhir ≥ 3× rata-rata & selisih ≥ 10 m³ (rata > 0) | kemungkinan **bocor** | tinggi |
| **nol** | terakhir = 0 padahal rata-rata > 0 | meter rusak / segel / kosong | tinggi |
| **turun** | rata ≥ 10 & 0 < terakhir ≤ 30% rata-rata | cek meter / penghuni | sedang |

## Backlog sprint

| Story | Judul | Epic | Est | Status |
|-------|-------|------|-----|--------|
| **S8-00** | `anomaly.util` murni (deteksi) + unit test | E9 | S | ✅ Done |
| **S8-01** | API `GET /reports/anomalies` (scan history + nama) | E9 | M | ✅ Done |
| **S8-02** | Mobile: `AnomalyScreen` (daftar + severity) + entry Home | E9 | M | ✅ Done |

> Sprint **selesai**. Bukti uji & retrospektif: `sprint-08-review.md`.

## Catatan teknis

- **Murni & teruji**: logika deteksi terpisah dari DB → unit test (standar kita).
- **Efisien**: satu query `history_meter` (≈3.800 baris) lalu group in-memory → jaga
  budget < 1 detik (`npm run perf`).
- Gratis, tanpa dependensi/biaya. (Pembayaran/WA menyusul setelah yang gratis.)

## Improvement

- Urut severity tinggi dulu, sertakan alasan + rasio + meter terakhir.
- (Backlog) peringatan inline saat petugas simpan catatan meter.

## Penutup

Hasil & bukti uji: `sprint-08-review.md`.
