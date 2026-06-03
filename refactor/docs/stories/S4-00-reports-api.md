# S4-00 — API: laporan (ringkasan KPI + rekap bulanan)

- **Epic:** E6 · **Sprint:** 4 · **Status:** Done · **Est:** M

## Story
> Sebagai **manajer/operator**, saya ingin **rekap penagihan & pemakaian**, agar
> **memantau kinerja penagihan tiap periode**.

## Acceptance Criteria
- [ ] `GET /reports/summary` → `{ totalPelanggan, bulanIni: { jumlahFaktur,
      totalTagihan, totalTerbayar, totalBelum, pemakaianM3 } }` untuk bulan & tahun
      berjalan.
- [ ] `GET /reports/monthly?months=6` → array `{ periode 'YYYY-MM', jumlahFaktur,
      totalTagihan, totalTerbayar }`, terbaru dulu, dibatasi `months` (default 6, max 24).
- [ ] Nilai uang/agregat berupa number; aman bila kosong (0).
- [ ] Terlindungi `JwtAuthGuard`.

## Tugas / Subtask
- [ ] `ReportsService` (QueryBuilder agregasi, parameter binding).
- [ ] Util murni `normalizeMonthlyRow` (cast number, hitung terbayar) + unit test.
- [ ] Controller + module; daftarkan di `AppModule`.

## Catatan Dev
`faktur.total` int; `transaksi.quantity` varchar → `CAST(... AS UNSIGNED)` saat
menjumlah pemakaian. Terbayar = total saat `is_lunas=1`. Data historis 2020 kaya;
bulan berjalan bisa 0 (wajar).

## DoD
Lihat [definition-of-done.md](../standards/definition-of-done.md).
