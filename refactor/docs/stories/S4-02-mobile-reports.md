# S4-02 — Mobile: layar Laporan (KPI + rekap bulanan)

- **Epic:** E6 · **Sprint:** 4 · **Status:** Done · **Est:** M

## Story
> Sebagai **manajer/operator**, saya ingin **dashboard ringkas**, agar **langsung
> melihat kondisi penagihan**.

## Acceptance Criteria
- [ ] Kartu KPI: total pelanggan, jumlah faktur bulan ini, total tagihan, terbayar,
      belum, pemakaian m³.
- [ ] Daftar rekap bulanan (periode, jumlah, total, terbayar) dari `GET /reports/monthly`.
- [ ] Loading / error / empty tertangani; rupiah diformat.
- [ ] Dapat dibuka dari menu Home.

## Tugas / Subtask
- [ ] `services`: `apiReportSummary()`, `apiReportMonthly(months)`.
- [ ] `ReportsScreen` + kartu KPI + list bulanan.
- [ ] Menu "Laporan" di Home + registrasi navigasi.

## DoD
Lihat [definition-of-done.md](../standards/definition-of-done.md).
