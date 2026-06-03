# Sprint 7 — Plan

**Tema:** Peta Konsumen (E8) — killer feature
**Tujuan sprint:** Tampilkan sebaran pelanggan di peta dengan **penanda status bayar**
(lunas/belum), dan admin bisa **mengatur titik koordinat** tiap pelanggan.

## Sasaran (Sprint Goal)

> "Dari satu peta, saya lihat semua pelanggan dengan warna status bayar, dan bisa
> menetapkan/memperbarui titik lokasi pelanggan dengan menekan di peta."

## Library (modern & gratis, tanpa API key)

- **Leaflet + OpenStreetMap** — open-source, gratis, tanpa kunci API.
- Render lintas-platform: `react-native-webview` (iOS/Android) & `<iframe>` (web) via
  file platform-specific (`LeafletMap.native.tsx` / `LeafletMap.web.tsx`).

## Backlog sprint

| Story | Judul | Epic | Est | Status |
|-------|-------|------|-----|--------|
| **S7-00** | DB: kolom lat/lng pelanggan + entity | E8 | S | ✅ Done |
| **S7-01** | API: `GET /customers/map` (status bayar) + `PATCH /:id/location` + test | E8 | M | ✅ Done |
| **S7-02** | Mobile: komponen `LeafletMap` (web/native) + `mapHtml` murni + test | E8 | L | ✅ Done |
| **S7-03** | Mobile: `MapScreen` (marker lunas/belum + legend) + `SetLocationScreen` (atur titik) | E8 | L | ✅ Done |

> Sprint **selesai**. Bukti uji & retrospektif: `sprint-07-review.md`.

## Status bayar penanda

Per pelanggan, dari **faktur terakhir**: `is_lunas=1` → **hijau (lunas)**; ada faktur
belum lunas → **merah (belum)**; belum ada faktur → **abu-abu (belum ada tagihan)**.

## Improvement (di luar permintaan inti)

- Legend & popup nama+alamat+status saat marker ditekan.
- Tombol "Atur Lokasi" di detail pelanggan → buka peta, tekan untuk menaruh pin, simpan.
- Auto-center ke rata-rata titik (default area Kab. Bandung).
- Indikator pelanggan yang **belum punya koordinat**.

## Batasan

- Peta butuh internet (tile OSM + Leaflet CDN) — di luar cakupan offline E7.
- Validasi koordinat: lat −90..90, lng −180..180.

## Penutup

Hasil & bukti uji: `sprint-07-review.md`.
