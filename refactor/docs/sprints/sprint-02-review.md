# Sprint 2 — Review & Retrospektif

**Tema:** QA guardrail + Manajemen pelanggan & tagihan (E3, E4)
**Status:** ✅ Selesai. Semua story Done, lolos Definition of Done.

## Hasil per story

| Story | Hasil | Bukti |
|-------|-------|-------|
| S2-00 Infra unit test (Jest) | ✅ Done | `npm test` → **28 test hijau** (tariff, auth, meter, util faktur, util history, mapper) |
| S2-01 API daftar pelanggan | ✅ Done | `GET /customers?search=DENI&limit=3` → 3 hasil, paging benar |
| S2-02 API detail + riwayat meter | ✅ Done | `GET /customers/200212503/history` → pemakaian antar-pembacaan benar (kasus reset 267→151 = 0) |
| S2-03 API daftar & detail faktur | ✅ Done | `GET /faktur` total 3326 (1187 lunas + 2139 belum); detail dgn item+meter; 404/401 benar |
| S2-04 Mobile daftar pelanggan | ✅ Done | layar + cari (debounce) + infinite scroll |
| S2-05 Mobile detail + riwayat | ✅ Done | layar detail + list riwayat + tombol Catat Meter |
| S2-06 Mobile daftar + detail tagihan | ✅ Done | layar list + filter (semua/bulan ini/belum lunas) + detail |

## Verifikasi guardrail

- Backend `npx jest`: **6 suite, 28 test, semua hijau.**
- Backend `tsc --noEmit`: lolos.
- Mobile `tsc --noEmit`: lolos.
- Mobile bundle Metro: **831 modul, tanpa error.**
- Endpoint Fase 2 diuji langsung ke DB `pdam` (lihat tabel di atas).

## Keputusan teknis (ADR baru)

- **ADR-004** pagination page/limit (didokumentasikan di architecture.md).
- Detail faktur memakai **query param** `noFaktur` (bukan path) karena no_faktur
  memuat '/' → hindari masalah encoding `%2F`.
- Ekstraksi **fungsi murni** (`faktur.util.ts`, `meter-history.util.ts`,
  `faktur-mapper.util.ts`) agar logika mudah diuji (praktik SRP dari coding-standards).

## Retrospektif

**Berjalan baik**
- Menulis util murni dulu → unit test cepat & bersih, langsung jadi guardrail.
- Reuse entity lintas modul (faktur pakai entity dari meter) tanpa duplikasi.

**Catatan / utang teknis**
- TD-3: Data riwayat lama tanggalnya tidak selalu urut dengan id; util mengurutkan
  by `id` (urutan input). Tinjau bila perlu urut by tanggal.
- TD-4: Endpoint upload foto (Sprint 1) masih `:noFaktur` di path — sebaiknya
  dipindah ke query/body seperti detail faktur. Masuk backlog perbaikan.

## Lingkungan dev (penting)

Port 3000 & 3001 di mesin dev terpakai aplikasi lain (Next.js & API Mongo). Saat uji,
API dijalankan di port bebas. **Set `PORT` di `.env` API & `EXPO_PUBLIC_API_URL` di
mobile** ke port yang dipakai.

## Berikutnya (Sprint 3 — E5)

Pembayaran/pelunasan faktur + cetak/kirim faktur (PDF). Lihat `prd.md` §4.
