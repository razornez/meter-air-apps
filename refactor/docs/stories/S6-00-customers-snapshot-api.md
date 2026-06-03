# S6-00 — API: snapshot pelanggan untuk cache offline

- **Epic:** E7b · **Sprint:** 6 · **Status:** Done · **Est:** M

## Story
> Sebagai **aplikasi mobile**, saya ingin **mengunduh ringkasan semua pelanggan +
> meter terakhir**, agar **bisa scan/cari pelanggan saat offline**.

## Acceptance Criteria
- [ ] `GET /customers/snapshot?page=&limit=` → `{ data, total, page, limit }`.
- [ ] Tiap item: `id, nama, alamat, tipe, barcode, lastMeter` (meter terakhir per
      pelanggan, 0 bila belum ada).
- [ ] Default `limit=200`, dibatasi maksimum (mis. 1000). Urut `id` asc.
- [ ] Terlindungi `JwtAuthGuard`.

## Tugas / Subtask
- [ ] `CustomersService.snapshot()` (QueryBuilder + subquery meter terakhir).
- [ ] Util murni `normalizeSnapshotRow` (cast number) + unit test.
- [ ] Route `@Get('snapshot')` SEBELUM `@Get(':id')` agar tidak ter-shadow.

## Catatan Dev
Meter terakhir = `history_meter` baris dengan `id` terbesar per `id_pelanggan`.
658 pelanggan → unduh berhalaman.

## DoD
Lihat [definition-of-done.md](../standards/definition-of-done.md).
