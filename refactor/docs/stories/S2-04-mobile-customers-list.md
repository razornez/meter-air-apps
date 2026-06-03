# S2-04 — Mobile: daftar pelanggan + cari

- **Epic:** E3 · **Sprint:** 2 · **Status:** Done · **Est:** M

## Story
> Sebagai **petugas**, saya ingin **layar daftar pelanggan dengan pencarian**, agar
> **menemukan pelanggan tanpa scan**.

## Acceptance Criteria
- [ ] Tab/menu "Pelanggan" menampilkan daftar (nama, id, tipe) dari `GET /customers`.
- [ ] Kotak cari (debounce) memanggil API dgn `search`.
- [ ] Infinite scroll / "muat lebih" memakai pagination.
- [ ] Menangani loading / error / empty.
- [ ] Tap item → buka detail pelanggan (S2-05).

## Tugas / Subtask
- [ ] `services`: `apiListCustomers(params)`.
- [ ] `CustomersListScreen` + komponen item.
- [ ] Tambah ke navigasi (dari Home).

## DoD
Lihat [definition-of-done.md](../standards/definition-of-done.md).
