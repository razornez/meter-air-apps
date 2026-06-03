# S9-00 — API worklist pencatatan

- **Epic:** E10 · **Sprint:** 9 · **Status:** Done · **Est:** M

## Story
> Sebagai **petugas**, saya ingin **daftar pelanggan yang belum dicatat bulan ini +
> progres**, agar **tahu siapa yang harus didatangi**.

## Acceptance Criteria
- [ ] `GET /reports/worklist` → `{ periode, total, done, pending, customers[] }`
      di mana `customers` = yang BELUM dicatat: `{ id, nama, alamat, tipe, barcode,
      lastMeter }`, urut nama.
- [ ] `done`/`pending`/`total` konsisten (done + pending = total).
- [ ] Efisien (< 1 detik) — tetap hijau di `npm run perf`.

## Tugas
- [ ] Util murni `partitionWorklist(customers, recordedIds)` + unit test.
- [ ] `ReportsService.worklist()` (set faktur bulan ini + pelanggan+lastMeter via
      derived join) + route.

## DoD
Lihat [definition-of-done.md](../standards/definition-of-done.md).
