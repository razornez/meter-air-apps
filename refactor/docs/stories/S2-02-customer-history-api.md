# S2-02 — API: detail pelanggan + riwayat meter

- **Epic:** E3 · **Sprint:** 2 · **Status:** Done · **Est:** M

## Story
> Sebagai **operator/petugas**, saya ingin **melihat detail pelanggan & riwayat
> catatan meternya**, agar **memahami pola pemakaian & memverifikasi anomali**.

## Acceptance Criteria
- [ ] `GET /customers/:id` → detail pelanggan + `lastMeter` + `alreadyRecordedThisMonth`.
- [ ] `GET /customers/:id/history?limit=` → daftar riwayat dari `history_meter`,
      terbaru dulu, tiap baris: `tanggal, meter, pemakaian (selisih dgn baris
      sebelumnya), noFaktur`.
- [ ] `pemakaian` dihitung sebagai selisih meter berurutan (baris tertua → 0/null).
- [ ] Terlindungi guard; 404 bila pelanggan tak ada.

## Tugas / Subtask
- [ ] `CustomersService.history(id, limit)` query `history_meter` order by id desc.
- [ ] Hitung pemakaian antar pembacaan (urut naik lalu mapping).
- [ ] Endpoint detail + history di controller.
- [ ] Unit test: perhitungan pemakaian antar baris (termasuk baris pertama).

## Catatan Dev
`history_meter.meter` bersifat kumulatif naik. Pemakaian = meter[n] − meter[n-1].
Hati-hati reset meter (selisih negatif → 0).

## DoD
Lihat [definition-of-done.md](../standards/definition-of-done.md).
