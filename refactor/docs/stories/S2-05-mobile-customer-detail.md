# S2-05 — Mobile: detail pelanggan + riwayat meter

- **Epic:** E3 · **Sprint:** 2 · **Status:** Done · **Est:** M

## Story
> Sebagai **petugas**, saya ingin **melihat detail pelanggan & riwayat pemakaian**,
> agar **memverifikasi data sebelum mencatat**.

## Acceptance Criteria
- [ ] Menampilkan detail (nama, alamat, tipe, meter terakhir).
- [ ] Daftar riwayat (tanggal, meter, pemakaian) dari `GET /customers/:id/history`.
- [ ] Tombol "Catat Meter" → buka `Reading` (alur Sprint 1) bila belum dicatat bulan ini.
- [ ] Loading / error / empty tertangani.

## Tugas / Subtask
- [ ] `services`: `apiCustomerDetail(id)`, `apiCustomerHistory(id)`.
- [ ] `CustomerDetailScreen` (info + list riwayat).
- [ ] Navigasi dari daftar pelanggan & ke Reading.

## DoD
Lihat [definition-of-done.md](../standards/definition-of-done.md).
