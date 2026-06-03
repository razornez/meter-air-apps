# Sprint 10 — Review & Retrospektif

**Tema:** Tunggakan + Denda (E11) + GPS Otomatis (E8b)
**Status:** ✅ Selesai. Semua story Done, lolos DoD.

## Hasil per story

| Story | Hasil | Bukti |
|-------|-------|-------|
| S10-00 API tunggakan | ✅ | `GET /reports/tunggakan` — 600 pelanggan, Rp93,9jt tagihan + Rp10,6jt denda; util `groupTunggakan` murni (+4 test); **9ms** |
| S10-01 Mobile Tunggakan | ✅ | TunggakanScreen (ringkasan grand total, daftar, tap→FakturList), kartu 💸 di Home |
| S10-02 GPS SetLocation | ✅ | Tombol "📍 Gunakan GPS saat ini" di SetLocationScreen; lintas-platform (expo-location native / browser Geolocation web) |
| S10-03 GPS Reading | ✅ | Banner "📍 Tandai lokasi saat ini?" bila pelanggan belum punya koordinat; best-effort background; tidak blok alur catat |

## Verifikasi guardrail

- Backend: **55 unit test** (+4 groupTunggakan); latensi 9ms.
- Mobile: **28 unit test**, typecheck bersih, bundle web 595 modul.
- **Perf**: `/reports/tunggakan` masuk `npm run perf`; semua endpoint < 1s ✅.

## Data nyata

- 600 pelanggan menunggak, **2132 faktur** (semua >90 hari — data historis 2020).
- Grand total: **Rp104,6 juta** (tagihan + denda).
- Teratas: YANI BUDIYANI — 6 faktur, Rp8,48jt.

## GPS otomatis

Lintas-platform: `expo-location` (native iOS/Android) + `navigator.geolocation`
(browser web). Langkah ini secara bertahap mengganti koordinat dummy dengan koordinat
asli lokasi pelanggan saat petugas mencatat meter di lapangan.

## Status epik

E1–E11 + E8b ✅. Alat petugas makin lengkap.
