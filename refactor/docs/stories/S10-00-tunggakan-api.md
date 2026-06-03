# S10-00 — API tunggakan

- **Epic:** E11 · **Sprint:** 10 · **Status:** Done · **Est:** M

## Story
> Sebagai **petugas penagih**, saya ingin **daftar pelanggan menunggak beserta total
> denda**, agar **tahu siapa dan berapa yang harus ditagih**.

## Acceptance Criteria
- [ ] `GET /reports/tunggakan?page=&limit=` → `{ data[], total, totalTagihan,
      totalDenda, page, limit }`.
- [ ] Tiap baris: `customerId, nama, alamat, jumlahFaktur, totalTagihan, totalDenda,
      grandTotal (tagihan+denda), hariTelatMax`.
- [ ] Urut `grandTotal` terbesar dulu. Pagination standar.
- [ ] Terlindungi guard. Efisien < 1 detik.

## Tugas
- [ ] Util murni `groupTunggakan(rows)` + unit test.
- [ ] `ReportsService.tunggakan(page, limit)`.
- [ ] Route + `ReportsModule` (sudah ada Customer, Faktur).

## DoD
[definition-of-done.md](../standards/definition-of-done.md).
