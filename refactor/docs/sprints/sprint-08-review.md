# Sprint 8 — Review & Retrospektif

**Tema:** Deteksi Anomali Konsumsi (E9) — killer feature gratis
**Status:** ✅ Selesai. Semua story Done, lolos Definition of Done.

## Hasil per story

| Story | Hasil | Bukti |
|-------|-------|-------|
| S8-00 util deteksi | ✅ Done | `anomaly.util` murni (lonjakan/nol/turun) + **7 unit test** |
| S8-01 API anomali | ✅ Done | `GET /reports/anomalies` — diuji ke DB, temukan kasus nyata (ADE RUKMIN 526 vs rata 6,6 = 79×); **latensi 35ms** |
| S8-02 Mobile | ✅ Done | `AnomalyScreen` (daftar + severity warna + alasan), kartu Anomali di Home |

## Nilai bisnis

Menangkap otomatis dari data yang sudah ada (gratis, tanpa biaya/dependensi):
- **Lonjakan** (≥3× & ≥10 m³) → kemungkinan **bocor**.
- **Nol** padahal historis ada → meter rusak / segel / kosong.
- **Turun drastis** → cek meter / penghuni.

Hasil nyata di data `pdam`: beberapa pelanggan dengan rasio puluhan kali → kandidat
kuat kebocoran/salah-baca untuk diverifikasi petugas.

## Verifikasi guardrail

- Backend: **48 unit test** (+7 anomaly), endpoint diuji ke DB.
- Mobile: **28 unit test**, typecheck bersih.
- **Perf**: `/reports/anomalies` ~35ms (jauh di bawah budget 1s); ditambahkan ke
  `npm run perf`.
- Bundle web sukses.

## Retrospektif

**Berjalan baik**
- Logika murni → unit-testable; ROI tinggi tanpa biaya, langsung temukan kasus nyata.
- Efisien: 1 query history (in-memory grouping) → cepat.

**Catatan / backlog**
- Ambang deteksi (3×, 10 m³, 30%) bisa dibuat configurable (per golongan/tipe).
- Inline warning saat petugas simpan catatan (peringatan langsung) — backlog.
- Berikutnya (gratis): **Pengaduan + Lapor Kebocoran berbasis peta**; lalu berbayar:
  pembayaran QRIS + notifikasi WhatsApp. Lihat `ENHANCEMENTS.md`.

## Status epik

E1–E9 ✅. Killer gratis (anomali) live. Backlog di `ENHANCEMENTS.md`.
