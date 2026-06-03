# S7-01 — API: data peta + atur lokasi

- **Epic:** E8 · **Sprint:** 7 · **Status:** Done · **Est:** M

## Story
> Sebagai **admin**, saya ingin **mengambil titik pelanggan beserta status bayar** dan
> **memperbarui koordinat pelanggan**, agar **peta akurat & bisa dikelola**.

## Acceptance Criteria
- [ ] `GET /customers/map` → daftar pelanggan ber-koordinat: `{ id, nama, alamat,
      lat, lng, status }` di mana `status` ∈ `lunas|belum|none` (dari faktur terakhir).
- [ ] `PATCH /customers/:id/location` body `{ latitude, longitude }` → simpan koordinat;
      validasi lat −90..90, lng −180..180; 404 bila pelanggan tak ada.
- [ ] Terlindungi `JwtAuthGuard`.

## Tugas
- [ ] Util murni `mapCustomerMarkerRow` (derive status, cast number) + unit test.
- [ ] `CustomersService.mapMarkers()` (join faktur terakhir) & `updateLocation()`.
- [ ] DTO `UpdateLocationDto` + route. `GET map` SEBELUM `:id`.

## DoD
Lihat [definition-of-done.md](../standards/definition-of-done.md).
