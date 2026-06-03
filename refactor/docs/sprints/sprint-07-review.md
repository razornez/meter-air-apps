# Sprint 7 — Review & Retrospektif

**Tema:** Peta Konsumen (E8) — killer feature
**Status:** ✅ Selesai. Semua story Done, lolos Definition of Done.

## Hasil per story

| Story | Hasil | Bukti |
|-------|-------|-------|
| S7-00 DB koordinat | ✅ Done | `migrations/003` (lat/lng DECIMAL) dijalankan; entity + transformer number |
| S7-01 API peta | ✅ Done | `GET /customers/map` (status lunas/belum/none dari faktur terakhir), `PATCH /:id/location` (validasi 400, 404); +4 unit test |
| S7-02 Komponen LeafletMap | ✅ Done | `mapHtml` murni (+4 test), `LeafletMap.web.tsx` (iframe) & `LeafletMap.tsx` (react-native-webview) |
| S7-03 Layar peta | ✅ Done | `MapScreen` (marker berwarna + legend), `SetLocationScreen` (tekan peta → simpan), menu Home, tombol di detail |

## Library (modern & gratis)

**Leaflet 1.9 + OpenStreetMap** — open-source, **tanpa API key**. Lintas-platform:
`<iframe>` (web) & `react-native-webview` (iOS/Android) via file platform-specific.

## Fitur

- Peta sebaran pelanggan; marker **hijau=lunas, merah=belum, abu=belum ada tagihan**
  (dari faktur terakhir). Popup nama+status; legend dengan jumlah.
- Admin atur titik: dari detail pelanggan → tekan peta → koordinat tampil → simpan
  (`PATCH /:id/location`).
- Auto-center ke rata-rata titik; default area Kab. Bandung.

## Verifikasi guardrail

- Backend: **41 unit test** (+4 map.util), endpoint diuji ke DB (3 pelanggan demo
  diberi koordinat: status lunas/belum benar; update titik; validasi 400; 404).
- Mobile: **28 unit test** (+4 mapHtml), typecheck bersih.
- Bundle: **web 585 modul** (iframe) & **android** (react-native-webview) — keduanya sukses.

## Retrospektif

**Berjalan baik**
- Leaflet+OSM lewat WebView/iframe → satu sumber HTML (`mapHtml` murni, teruji) jalan
  di web & native tanpa biaya/API key.
- Status bayar di-derive dari faktur terakhir → langsung berguna untuk penagihan spasial.

**Catatan / backlog**
- Peta butuh internet (tile OSM + Leaflet CDN); offline-map di luar cakupan.
- Banyak pelanggan belum punya koordinat → perlu pengisian massal (impor / GPS petugas
  saat catat meter). Usul: tombol "pakai GPS saat ini" via `expo-location` (E8b).
- Klaster marker bila titik sangat banyak (leaflet.markercluster).

## Status epik

E1–E8 ✅. Killer feature peta live. Backlog: E8b (GPS petugas, impor massal koordinat),
pembayaran digital, OCR meter (lihat ENHANCEMENTS.md).
