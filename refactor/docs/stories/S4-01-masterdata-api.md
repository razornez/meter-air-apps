# S4-01 — API: master data (produk + supplier)

- **Epic:** E6 · **Sprint:** 4 · **Status:** Done · **Est:** M

## Story
> Sebagai **operator**, saya ingin **menelusuri data master (produk & supplier)**, agar
> **memverifikasi referensi yang dipakai sistem**.

## Acceptance Criteria
- [ ] `GET /produk?search=&page=&limit=` → `{ data, total, page, limit }`
      (id, barcode, nama, satuan, hargaJual, stok).
- [ ] `GET /supplier?search=&page=&limit=` → `{ data, total, page, limit }`
      (id, nama, alamat, telepon).
- [ ] Pagination standar (default limit 20, max 100). Terlindungi guard.

## Tugas / Subtask
- [ ] Entity `Produk`, `Supplier` map ke tabel.
- [ ] `CatalogService.listProduk()` & `listSupplier()` (QueryBuilder + binding).
- [ ] Controller + module; daftarkan di `AppModule`.

## Catatan Dev
Modul `catalog` (read-only). CRUD master = fase lanjut. `produk.stok`/`harga`
bertipe varchar di skema lama → kembalikan apa adanya / cast number bila perlu.

## DoD
Lihat [definition-of-done.md](../standards/definition-of-done.md).
