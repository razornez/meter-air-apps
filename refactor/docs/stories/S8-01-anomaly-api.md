# S8-01 — API daftar anomali

- **Epic:** E9 · **Sprint:** 8 · **Status:** Done · **Est:** M

## Story
> Sebagai **operator/manajer**, saya ingin **daftar pelanggan dengan pemakaian janggal**,
> agar **bisa menindaklanjuti (cek bocor/meter)**.

## Acceptance Criteria
- [ ] `GET /reports/anomalies?limit=` → daftar `{ customerId, nama, alamat, type,
      severity, latest, rata, rasio, alasan, lastMeter, tanggal }`.
- [ ] Diurutkan severity tinggi dulu, lalu rasio terbesar.
- [ ] Efisien: 1 query history (group in-memory); latensi < 1 detik.
- [ ] Terlindungi guard.

## Tugas
- [ ] `ReportsService.anomalies()` (scan history_meter, hitung pemakaian, deteksi,
      lampirkan nama/alamat). Tambah `HistoryMeter` ke `ReportsModule`.
- [ ] Route di `ReportsController`. Uji ke DB + cek `npm run perf` tetap hijau.

## DoD
Lihat [definition-of-done.md](../standards/definition-of-done.md).
