# S7-02 — Mobile: komponen LeafletMap

- **Epic:** E8 · **Sprint:** 7 · **Status:** Done · **Est:** L

## Story
> Sebagai **pengembang**, saya ingin **komponen peta Leaflet lintas-platform**, agar
> **peta tampil di browser & iPhone tanpa kunci API**.

## Acceptance Criteria
- [ ] `mapHtml.ts` murni: bangun HTML Leaflet dari daftar marker (warna per status),
      opsi `editable` (tekan peta → kirim koordinat). Unit test.
- [ ] `LeafletMap.web.tsx` (`<iframe srcDoc>`) & `LeafletMap.native.tsx`
      (`react-native-webview`) — API sama: `markers`, `center`, `editable`, `onPick`.
- [ ] Marker bisa ditekan → popup nama/status. Mode editable kirim `{lat,lng}` ke RN.

## Tugas
- [ ] `expo install react-native-webview`.
- [ ] `components/mapHtml.ts` (+ test), `LeafletMap.web.tsx`, `LeafletMap.native.tsx`,
      `LeafletMap.ts` (tipe & re-export).

## Catatan
Leaflet + tile OSM via CDN (butuh internet). Jembatan pesan: `ReactNativeWebView.postMessage`
(native) / `window.parent.postMessage` (web).

## DoD
Lihat [definition-of-done.md](../standards/definition-of-done.md).
