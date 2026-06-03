# S2-01 — API: daftar pelanggan (search + pagination)

- **Epic:** E3 · **Sprint:** 2 · **Status:** Done · **Est:** M

## Story
> Sebagai **operator**, saya ingin **mencari & menelusuri daftar pelanggan**, agar
> **menemukan pelanggan tanpa harus scan di lapangan**.

## Acceptance Criteria
- [ ] `GET /customers?search=&page=&limit=` mengembalikan `{ data, total, page, limit }`.
- [ ] `search` mencocokkan `nama` ATAU `id` ATAU `alamat` (case-insensitive).
- [ ] Default `page=1`, `limit=20`; `limit` dibatasi maksimum (mis. 100).
- [ ] Urut by `nama` asc. Terlindungi `JwtAuthGuard`.
- [ ] Tiap item ringkas: `id, nama, alamat, tipe, barcode`.

## Tugas / Subtask
- [ ] DTO query (`ListCustomersDto`) dengan validasi `page/limit/search`.
- [ ] `CustomersService.list()` pakai QueryBuilder (parameter binding) + `getManyAndCount`.
- [ ] Endpoint di `CustomersController`.
- [ ] Unit test service: paging, search match, batas limit.

## Catatan Dev
Tabel `customer` (658 baris). Hindari `LIKE` tanpa binding. `id` numerik besar
(mis. 200212011) → cocokkan sebagai string juga.

## DoD
Lihat [definition-of-done.md](../standards/definition-of-done.md).
