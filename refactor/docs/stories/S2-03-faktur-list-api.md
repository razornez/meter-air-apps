# S2-03 — API: daftar & detail faktur (tagihan)

- **Epic:** E4 · **Sprint:** 2 · **Status:** Done · **Est:** L

## Story
> Sebagai **operator**, saya ingin **melihat daftar tagihan dengan filter & detailnya**,
> agar **memantau status penagihan pelanggan**.

## Acceptance Criteria
- [ ] `GET /faktur?customerId=&month=&year=&isLunas=&page=&limit=` →
      `{ data, total, page, limit }`, terbaru dulu.
- [ ] Tiap item: `noFaktur, tanggal, customerId, namaPelanggan, total, isLunas,
      tglJatuhTempo`.
- [ ] `GET /faktur/:noFaktur` → detail faktur + nama pelanggan + baris `transaksi`
      + meter terkait (dari `history_meter`).
- [ ] Filter opsional & bisa dikombinasikan. Terlindungi guard. 404 bila tak ada.

## Tugas / Subtask
- [ ] Modul `faktur` baru: entity reuse `Faktur`/`Transaksi`, service, controller, DTO.
- [ ] `FakturService.list()` join `customer` untuk nama (QueryBuilder + binding).
- [ ] `FakturService.detail()` ambil faktur + transaksi + history_meter.
- [ ] Unit test: pembentukan filter where (customerId/month/year/isLunas) & mapping.

## Catatan Dev
`faktur.customer` bertipe varchar berisi id pelanggan → cast saat join. `isLunas`
int(0/1). Normalisasi tanggal ke ISO di service (format lama tak konsisten).

## DoD
Lihat [definition-of-done.md](../standards/definition-of-done.md).
