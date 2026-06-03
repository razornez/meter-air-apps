# S2-06 — Mobile: daftar tagihan + detail

- **Epic:** E4 · **Sprint:** 2 · **Status:** Done · **Est:** M

## Story
> Sebagai **operator/petugas**, saya ingin **melihat daftar tagihan & detailnya**,
> agar **memantau status penagihan**.

## Acceptance Criteria
- [ ] Layar "Tagihan" menampilkan daftar faktur (no, tanggal, pelanggan, total,
      status lunas) dari `GET /faktur`.
- [ ] Filter cepat: bulan ini / belum lunas (memakai query API).
- [ ] Tap item → detail faktur (`GET /faktur/:noFaktur`) dgn rincian transaksi.
- [ ] Status lunas/belum ditandai visual (warna/badge).
- [ ] Loading / error / empty tertangani.

## Tugas / Subtask
- [ ] `services`: `apiListFaktur(params)`, `apiFakturDetail(noFaktur)`.
- [ ] `FakturListScreen` + `FakturDetailScreen`.
- [ ] Tambah ke navigasi (dari Home).

## DoD
Lihat [definition-of-done.md](../standards/definition-of-done.md).
