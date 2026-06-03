# S7-03 — Mobile: layar Peta & Atur Lokasi

- **Epic:** E8 · **Sprint:** 7 · **Status:** Done · **Est:** L

## Story
> Sebagai **admin**, saya ingin **melihat sebaran pelanggan di peta dengan status bayar
> dan mengatur titik tiap pelanggan**, agar **memantau penagihan secara spasial**.

## Acceptance Criteria
- [ ] `MapScreen`: tampilkan semua pelanggan ber-koordinat dari `GET /customers/map`;
      marker **hijau=lunas, merah=belum, abu=belum ada tagihan**; legend; popup info.
- [ ] `SetLocationScreen` (dari detail pelanggan): tekan peta untuk menaruh pin,
      tampilkan koordinat, **Simpan** → `PATCH /:id/location` → kembali & refresh.
- [ ] Menu **Peta** di Home; tombol **Atur Lokasi** di detail pelanggan.
- [ ] Loading/error/empty tertangani.

## Tugas
- [ ] `services`: `apiCustomersMap`, `apiUpdateLocation`.
- [ ] `MapScreen`, `SetLocationScreen`, navigasi, menu Home, tombol detail.

## DoD
Lihat [definition-of-done.md](../standards/definition-of-done.md).
