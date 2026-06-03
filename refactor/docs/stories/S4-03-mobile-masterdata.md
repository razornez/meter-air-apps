# S4-03 — Mobile: layar Master Data (produk + supplier)

- **Epic:** E6 · **Sprint:** 4 · **Status:** Done · **Est:** M

## Story
> Sebagai **operator**, saya ingin **melihat data master di aplikasi**, agar **tidak
> perlu membuka sistem lama**.

## Acceptance Criteria
- [ ] Layar Master Data dengan dua tab/segmen: **Produk** & **Supplier**.
- [ ] Masing-masing menampilkan daftar dari API (cari + pagination/infinite scroll).
- [ ] Loading / error / empty tertangani.
- [ ] Dapat dibuka dari menu Home.

## Tugas / Subtask
- [ ] `services`: `apiListProduk()`, `apiListSupplier()`.
- [ ] `MasterDataScreen` (segmented) + item produk/supplier.
- [ ] Menu "Master" di Home + registrasi navigasi.

## DoD
Lihat [definition-of-done.md](../standards/definition-of-done.md).
