# Sprint 4 — Plan

**Tema:** Laporan/rekap & master data (E6)
**Tujuan sprint:** Manajer/operator dapat melihat **rekap penagihan & pemakaian** serta
**data master (produk, supplier)** dari aplikasi.

## Sasaran (Sprint Goal)

> "Saya bisa melihat ringkasan KPI (pelanggan, tagihan, terbayar, pemakaian) dan rekap
> per bulan, plus menelusuri data master — semua di atas stack modern & teruji."

## Backlog sprint

| Story | Judul | Epic | Est | Status |
|-------|-------|------|-----|--------|
| **S4-00** | API: laporan (ringkasan KPI + rekap bulanan) | E6 | M | ✅ Done |
| **S4-01** | API: master data (produk + supplier, list/cari) | E6 | M | ✅ Done |
| **S4-02** | Mobile: layar Laporan (KPI + rekap bulanan) | E6 | M | ✅ Done |
| **S4-03** | Mobile: layar Master Data (produk + supplier) | E6 | M | ✅ Done |

> Sprint **selesai**. Bukti uji & retrospektif: `sprint-04-review.md`.

## Urutan dependensi

**S4-00, S4-01 (paralel) → S4-02, S4-03.**

## Di luar lingkup (sengaja)

- **Panel admin web** (frontend web terpisah): inisiatif besar tersendiri → ditunda
  sebagai epik lanjutan (E6b). Sprint ini fokus API + tampilan di mobile.
- Tabel `pembayaran` (TD-5) tetap backlog.
- Stok masuk/keluar (`stok_masuk`/`stok_keluar`): tidak relevan untuk air → ditunda.

## Catatan stack (permintaan: pastikan modern & terbaru)

- Backend di-upgrade **NestJS 10 → 11** (+ @nestjs/config 4, typeorm 11, class-validator
  0.15, bcryptjs 3). 31 test tetap hijau, boot OK.
- Mobile **Expo SDK 56 / React 19 / RN 0.85** — sudah mutakhir (`expo install --check`
  bersih).
- Sampah dibersihkan: sisa template `create-expo-app` (`AGENTS.md`, `CLAUDE.md`,
  `LICENSE`) dihapus; tidak ada dead code di `api/src`.

## Penutup

Hasil & bukti uji: `sprint-04-review.md`.
