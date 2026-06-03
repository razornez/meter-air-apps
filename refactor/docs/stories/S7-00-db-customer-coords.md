# S7-00 — DB: koordinat pelanggan

- **Epic:** E8 · **Sprint:** 7 · **Status:** Done · **Est:** S

## Story
> Sebagai **sistem**, saya ingin **menyimpan koordinat tiap pelanggan**, agar **bisa
> ditampilkan di peta**.

## Acceptance Criteria
- [ ] Migrasi tambah kolom `latitude` & `longitude` (DECIMAL(10,7), nullable) di `customer`.
- [ ] Entity `Customer` punya `latitude`/`longitude` (number|null).
- [ ] Aditif, non-destruktif; tidak mengubah data lama.

## Tugas
- [ ] `migrations/003_add_customer_coords.sql` + jalankan.
- [ ] Update `Customer` entity.

## DoD
Lihat [definition-of-done.md](../standards/definition-of-done.md).
