# Sprint 9 — Plan

**Tema:** Worklist Pencatatan (E10) — alat harian petugas
**Tujuan sprint:** Petugas tahu **persis siapa yang belum dicatat meternya bulan ini**
dan progres pencatatan, lalu langsung mencatat dari daftar itu.

## Sasaran (Sprint Goal)

> "Buka aplikasi → lihat progres (mis. 420/658) → daftar pelanggan yang belum dicatat
> → tekan satu untuk langsung catat meter."

## Backlog sprint

| Story | Judul | Epic | Est | Status |
|-------|-------|------|-----|--------|
| **S9-00** | API `GET /reports/worklist` (progres + daftar belum dicatat) + util murni + test | E10 | M | ✅ Done |
| **S9-01** | Mobile `WorklistScreen` (progres + daftar, tap→catat) + kartu Home | E10 | M | ✅ Done |

> Sprint **selesai**. Bukti uji & retrospektif: `sprint-09-review.md`.

## Logika

- "Sudah dicatat bulan ini" = punya `faktur` dengan bulan & tahun berjalan (sama
  dengan guard `alreadyRecordedThisMonth`, tapi untuk SEMUA pelanggan sekaligus).
- **Pending** = semua pelanggan − yang sudah punya faktur bulan ini.
- Sertakan `lastMeter` agar petugas bisa langsung catat (tap → layar Reading).

## Catatan teknis

- Efisien: 1 query "customer bulan ini" (set id) + 1 query pelanggan+lastMeter
  (derived-table JOIN, seperti optimasi peta) → group in-memory. Jaga `npm run perf` < 1s.
- Logika partisi (`pending` vs `done`) dibuat **murni** → unit test.

## Penutup

Hasil & bukti uji: `sprint-09-review.md`.
