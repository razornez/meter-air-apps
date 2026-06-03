# Sprint 3 — Plan

**Tema:** Pelunasan tagihan & cetak/kirim faktur (E5)
**Tujuan sprint:** Petugas/operator dapat menandai tagihan **lunas/batal lunas** dan
**mencetak/membagikan faktur sebagai PDF** dari aplikasi.

## Sasaran (Sprint Goal)

> "Dari detail tagihan, saya bisa menandai lunas dan langsung mencetak/membagikan
> faktur PDF berkop perusahaan — semua perubahan status teraudit & teruji."

## Backlog sprint

| Story | Judul | Epic | Est | Status |
|-------|-------|------|-----|--------|
| **S3-00** | API: konfigurasi perusahaan (`GET /config`) untuk kop faktur | E5 | S | ✅ Done |
| **S3-01** | API: pelunasan faktur (set/batal lunas) + audit log | E5 | M | ✅ Done |
| **S3-02** | Mobile: aksi Tandai Lunas / Batal Lunas di detail tagihan | E5 | M | ✅ Done |
| **S3-03** | Mobile: cetak & bagikan faktur PDF (expo-print/sharing) | E5 | M | ✅ Done |

> Sprint **selesai**. Bukti uji & retrospektif: `sprint-03-review.md`.

## Urutan dependensi

**S3-00 → S3-01 → S3-02 → S3-03** (S3-03 butuh data config dari S3-00 untuk kop).

## Batasan & keputusan

- **Tidak mengubah skema MySQL.** Pelunasan memakai kolom yang ada:
  `faktur.is_lunas` (0/1) + `transaksi.dibayar`. Riwayat pembayaran detail
  (jumlah/metode/waktu per transaksi pembayaran) **di luar lingkup** — perlu tabel
  `pembayaran` baru via migrasi (backlog, ADR-005).
- Audit perubahan status ditulis ke `log_aktivitas`.
- PDF dibuat di **sisi mobile** (`expo-print`) lalu dibagikan (`expo-sharing`),
  bukan server-side — lebih ringan & idiomatik Expo (ADR-006).

## Definition of Ready

AC jelas · kontrak data disepakati · dependensi (config) tersedia.

## Penutup

Hasil & bukti uji dicatat di `sprint-03-review.md`.
