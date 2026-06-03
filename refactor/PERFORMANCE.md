# Performa API — Guardrail & Hasil

**Budget: tidak ada endpoint fetch data > 1000 ms.** Dijaga oleh skrip
[`api/scripts/perf-check.mjs`](api/scripts/perf-check.mjs) (`npm run perf`) yang
mengukur latensi tiap endpoint dan **gagal (exit 1)** bila ada yang melebihi budget.

## Cara menjalankan

```bash
cd refactor/api
# jalankan server (throttle dinaikkan agar tak mengganggu pengukuran)
PORT=4000 THROTTLE_LIMIT=100000 npm run start:dev
# di terminal lain:
PERF_API=http://localhost:4000/api npm run perf
# opsi: PERF_RUNS=5 PERF_BUDGET_MS=1000
```

## Hasil terukur (DB `pdam`, 658 pelanggan · 3.326 faktur · ~3.800 history_meter)

Runs=5 per endpoint. Lingkungan: lokal (XAMPP MySQL, Node 20). Angka = waktu respons
penuh (termasuk transfer body).

| Endpoint | Status | min | avg | max | OK |
|----------|:------:|----:|----:|----:|:--:|
| POST /auth/login | 201 | 6.8 | 6.8 | 6.8 | ✓ |
| GET /auth/me | 200 | 2.8 | 3.6 | 4.4 | ✓ |
| POST /meter/calculate | 201 | 4.0 | 4.5 | 5.1 | ✓ |
| GET /customers?limit=20 | 200 | 3.8 | 4.8 | 5.5 | ✓ |
| GET /customers?search=DENI | 200 | 3.5 | 3.7 | 3.9 | ✓ |
| GET /customers/:id | 200 | 2.8 | 3.5 | 5.2 | ✓ |
| GET /customers/:id/history | 200 | 2.4 | 2.6 | 2.8 | ✓ |
| GET /customers/resolve/:id | 200 | 4.2 | 4.7 | 4.9 | ✓ |
| **GET /customers/snapshot (658, limit=1000)** | 200 | 9.1 | 11.1 | **12.7** | ✓ |
| GET /faktur?limit=20 | 200 | 3.4 | 4.0 | 4.4 | ✓ |
| GET /faktur?customerId | 200 | 2.2 | 2.6 | 2.7 | ✓ |
| GET /faktur?isLunas=0 | 200 | 2.9 | 3.4 | 3.6 | ✓ |
| GET /faktur/detail | 200 | 5.7 | 6.3 | 7.6 | ✓ |
| GET /faktur/payments | 200 | 1.9 | 2.4 | 2.6 | ✓ |
| GET /reports/summary | 200 | 4.0 | 4.8 | 5.4 | ✓ |
| GET /reports/monthly=12 | 200 | 5.5 | 6.6 | 8.1 | ✓ |
| GET /produk | 200 | 1.8 | 2.6 | 4.2 | ✓ |
| GET /supplier | 200 | 1.8 | 2.0 | 2.4 | ✓ |
| GET /config | 200 | 1.8 | 2.0 | 2.2 | ✓ |

**Terlambat: `/customers/snapshot` = 12.7 ms (≈79× di bawah budget 1000 ms).**
✅ Semua endpoint lolos.

## Optimasi yang diterapkan

Index DB ([`migrations/002_add_indexes.sql`](api/migrations/002_add_indexes.sql)) —
mencegah full-scan pada query lookup terberat:

- `history_meter(id_pelanggan)` → snapshot, meter terakhir, riwayat.
- `transaksi(faktur)` → detail faktur, rekap pemakaian.
- `faktur(customer)` → daftar tagihan per pelanggan, cek catatan bulan ini.
- `faktur(tanggal)` → rekap.

> Tanpa index, `/customers/snapshot` (subquery `MAX(id)` per 658 pelanggan) berisiko
> lambat. Dengan index, turun ke belasan milidetik.

## Catatan

- Guardrail ini menguji **latensi per request** di lingkungan lokal. Untuk produksi,
  ukur juga di bawah beban (mis. autocannon/k6) & dengan latensi jaringan nyata.
- `POST /auth/login` di-rate-limit 10/menit; perf-check mengukurnya 1× (429 di luar
  itu adalah proteksi, bukan masalah performa).
- Jalankan `npm run perf` setiap menambah endpoint/query baru sebagai bagian QA.
