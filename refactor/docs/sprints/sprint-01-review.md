# Sprint 1 — Review & Retrospektif

**Tema:** Fondasi + alur inti lapangan (E1 Auth, E2 Pencatatan Meter)
**Status:** ✅ Selesai & terverifikasi end-to-end terhadap DB `pdam`.

## Yang dikerjakan

| Story | Hasil |
|-------|-------|
| S1-01 Scaffold API NestJS + koneksi MySQL `pdam` | ✅ |
| S1-02 Auth JWT + backward-compat password plaintext (ADR-002) | ✅ |
| S1-03 Entity & modul meter (customer, history_meter, level_pemakaian, faktur, transaksi) | ✅ |
| S1-04 Port logika tarif berjenjang `getTotalbyMeter` → `TariffService` | ✅ |
| S1-05 Endpoint resolve pelanggan + simpan catatan meter (atomik) + foto | ✅ |
| S1-06 Scaffold mobile Expo + auth + scan + input meter | ✅ |

## Bukti verifikasi

- Login `admin` (password plaintext lama) → JWT ✅
- Hitung tarif tipe B 25 m³ = **Rp60.000** (blok 1:10, 2:10, 3:5) ✅
- Simpan catatan → faktur `FA/BD/26/06/xxxx`, total = subtotal + beban 5.000 ✅
- Dobel-catat bulan sama → **409** ✅ · tanpa token → **401** ✅
- Mobile bundle Metro: 826 modul tanpa error ✅

## Retrospektif

**Berjalan baik**
- Reuse DB lama tanpa migrasi → risiko data rendah.
- Port logika tarif 1:1 terbukti akurat lewat uji nyata.

**Perlu diperbaiki (action item → Sprint 2)**
- Belum ada **unit test otomatis** → masuk Sprint 2 sebagai guardrail (S2-00).
- Belum ada sistem dokumentasi/story → dibuat di awal Sprint 2 (dokumen ini).
- `customer.barcode` kosong → QR fisik perlu strategi pengisian (backlog E6).

## Utang teknis tercatat

- TD-1: `transaksi` lama menyimpan stok produk air dummy — diabaikan di alur baru
  (air tak punya stok riil). Bersihkan saat E6.
- TD-2: `generateNoFaktur` pakai counter global (bukan reset per bulan) — sesuai
  perilaku lama; tinjau ulang bila perlu format baru.
