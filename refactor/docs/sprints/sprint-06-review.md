# Sprint 6 — Review & Retrospektif

**Tema:** Lookup pelanggan offline (E7b) — melengkapi E7
**Status:** ✅ Selesai. Semua story Done, lolos Definition of Done.

## Hasil per story

| Story | Hasil | Bukti |
|-------|-------|-------|
| S6-00 API snapshot pelanggan | ✅ Done | `GET /customers/snapshot` → 658 pelanggan + lastMeter benar (200212011=4420); route `:id` tak ter-shadow; +2 unit test |
| S6-01 Cache pelanggan | ✅ Done | AsyncStorage + `resolveFromCache`/`searchCache` murni; refresh saat login; **7 unit test** |
| S6-02 Lookup offline | ✅ Done | ScanScreen & Home lookup fallback ke cache saat jaringan mati; indikator cache di Home |

## Desain kunci

- **Snapshot backend:** `lastMeter` per pelanggan via subquery `MAX(history_meter.id)`.
  Berhalaman (`page`/`limit`, default 200, maks 1000).
- **Cache mobile:** AsyncStorage (~658 baris ≈ 66KB) + cari/resolve **in-memory murni**
  → unit-testable tanpa perangkat/SQLite.
- **Offline `alreadyRecordedThisMonth`:** diturunkan dari **antrian lokal** (E7) →
  pelanggan yang sudah diantre tidak bisa dobel-antre.
- **Fallback transparan:** online → API; error jaringan → `resolveOffline` dari cache.
- **Refresh:** otomatis saat login + tombol manual di Home; tampil jumlah & waktu sinkron.

## Verifikasi guardrail

- Mobile `npx jest`: **5 suite, 24 test** (17 sebelumnya + 7 cache), semua hijau.
- Backend `npx jest`: **9 suite, 37 test** (+2 snapshot), semua hijau.
- Typecheck (backend & mobile): lolos.
- Bundle Metro: sukses. Endpoint snapshot diuji ke DB (658 baris).

## Retrospektif

**Berjalan baik**
- Memilih AsyncStorage + logika murni (bukan SQLite) → lebih sederhana & sepenuhnya
  teruji; cukup untuk volume saat ini.
- E7 + E7b kini melengkapi: **baca & tulis** pelanggan jalan offline.

**Catatan / backlog**
- Bila data pelanggan tumbuh sangat besar (puluhan ribu), pertimbangkan SQLite +
  sinkron inkremental (`?since=`).
- `alreadyRecordedThisMonth` offline adalah perkiraan (berbasis antrian); kebenaran
  final tetap dijamin guard server 409 saat sync.

## Status epik

E1–E7 + **E7b** ✅ (inti + offline lengkap). Berikutnya: **hardening security**.
