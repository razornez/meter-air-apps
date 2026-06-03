# Sprint 4 — Review & Retrospektif

**Tema:** Laporan/rekap & master data (E6) + modernisasi stack & bersih-bersih
**Status:** ✅ Selesai. Semua story Done, lolos Definition of Done.

## Hasil per story

| Story | Hasil | Bukti |
|-------|-------|-------|
| S4-00 API laporan | ✅ Done | `/reports/summary` (658 pelanggan); `/reports/monthly` → 2020-05: 563 faktur, Rp27,6jt tagihan, Rp7,19jt terbayar; +2 unit test |
| S4-01 API master data | ✅ Done | `/produk` (Air PDAM, Pemasangan Baru), `/supplier` (3) — paginated; 401 benar |
| S4-02 Mobile Laporan | ✅ Done | layar KPI + rekap 6 bulan |
| S4-03 Mobile Master Data | ✅ Done | layar segmen Produk/Supplier + cari |

## Modernisasi stack (permintaan khusus)

- **Backend NestJS 10 → 11** (+ @nestjs/config 4, @nestjs/typeorm 11, @nestjs/jwt 11,
  @nestjs/passport 11, class-validator 0.15, bcryptjs 3). Typecheck bersih; **33 test
  hijau**; boot + login + tarif terverifikasi ke DB.
  - Penyesuaian: `@nestjs/jwt` v11 mengetatkan tipe `expiresIn` (cast terdokumentasi);
    hapus `@types/bcryptjs` (bcryptjs 3 bawa tipe sendiri); `@types/express` → 5.
- **Mobile** tetap Expo SDK 56 / React 19 / RN 0.85 — sudah mutakhir
  (`expo install --check` bersih).

## Bersih-bersih

- Hapus sisa template `create-expo-app`: `mobile/AGENTS.md`, `mobile/CLAUDE.md`,
  `mobile/LICENSE`.
- Audit dead code di `api/src`: tidak ada file yatim / export tak terpakai.

## Verifikasi guardrail

- Backend `npx jest`: **8 suite, 33 test, semua hijau** (+2 dari Sprint 3).
- Backend & mobile `tsc --noEmit`: lolos.
- Mobile bundle Metro: **840 modul, tanpa error**.
- Endpoint Sprint 4 diuji langsung ke DB `pdam` (read-only, tanpa mutasi data).

## Retrospektif

**Berjalan baik**
- Upgrade mayor NestJS mulus karena kode mengikuti API standar + ada 33 test sebagai
  jaring pengaman → percaya diri saat bump versi.
- Util murni (`normalizeMonthlyRow`) langsung teruji.

**Catatan / utang teknis**
- TD-5 tabel `pembayaran` (riwayat bayar granular) — masih backlog.
- TD-6 unit test mobile (jest-expo) — masih backlog.
- **TD-7 (baru):** **Panel admin web** (E6b) belum dibuat — inisiatif frontend web
  terpisah (mis. Next.js). Direkomendasikan jadi epik tersendiri.
- Catatan lingkungan: Node dev v20.17 sedikit di bawah rekomendasi Expo (≥20.19.4);
  saran update Node LTS.

## Status epik

E1–E6 (inti) ✅ selesai. Sisa: **E6b panel admin web**, **E7 mode offline + sync**.
Lihat `prd.md`.
