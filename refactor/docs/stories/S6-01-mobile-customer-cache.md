# S6-01 — Mobile: cache pelanggan + refresh

- **Epic:** E7b · **Sprint:** 6 · **Status:** Done · **Est:** L

## Story
> Sebagai **petugas**, saya ingin **data pelanggan tersimpan di perangkat**, agar
> **tetap bisa dipakai saat tidak ada sinyal**.

## Acceptance Criteria
- [ ] Snapshot pelanggan diunduh (berhalaman) & disimpan lokal (AsyncStorage) beserta
      waktu sinkron terakhir.
- [ ] Refresh otomatis saat online/login; manual via tombol.
- [ ] Fungsi `resolveFromCache(code)` (barcode→id) & `searchCache(query)` **murni** →
      unit test hijau.

## Tugas / Subtask
- [ ] `offline/customerCache.ts` (load/save + pure resolve/search) + unit test.
- [ ] Integrasi ke `OfflineContext`: `refreshCustomerCache`, `cacheSyncedAt`,
      `resolveOffline`, `searchOffline`, `hasPendingForCustomer`.

## Catatan Dev
~658 pelanggan (~66KB JSON) → AsyncStorage + cari in-memory cukup (tak perlu SQLite).
Logika murni di-test; penyimpanan tipis.

## DoD
Lihat [definition-of-done.md](../standards/definition-of-done.md).
