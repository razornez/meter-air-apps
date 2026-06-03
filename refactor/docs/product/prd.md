# PRD — Aplikasi Meter Air (Refactor)

**Status dokumen:** hidup (diperbarui tiap sprint) · **Pemilik:** PM/Analyst

## 1. Visi

Mengganti aplikasi PDAM lama (CodeIgniter 3, web) dengan platform modern: **API
NestJS** + **aplikasi mobile React Native** untuk petugas lapangan, dengan database
MySQL `pdam` yang sama. Tujuan: pencatatan meter lebih cepat, akurat, dan andal
(termasuk foto bukti), tanpa migrasi data berisiko.

## 2. Persona

| Persona | Kebutuhan utama |
|---------|-----------------|
| **Petugas Catat Meter** (lapangan) | Scan/cari pelanggan cepat, input angka meter, lihat tagihan otomatis, foto meter, kerja walau sinyal lemah |
| **Admin/Operator** (kantor) | Lihat daftar pelanggan, riwayat pemakaian, daftar & status tagihan |
| **Kepala/Manajer** | Rekap pemakaian & penerimaan (fase lanjutan) |

## 3. Metrik sukses

- Waktu catat 1 pelanggan < 30 detik.
- 0 kasus dobel-catat per bulan (dijaga guard server).
- Tagihan terhitung 100% sesuai tarif berjenjang resmi.
- Cakupan unit test ≥ 80% pada logika bisnis (tarif, faktur, auth).

## 4. Epic

| ID | Epic | Status |
|----|------|--------|
| **E1** | Autentikasi & sesi petugas (JWT) | ✅ Selesai (Sprint 1) |
| **E2** | Pencatatan meter lapangan (scan, hitung, simpan, foto) | ✅ Selesai (Sprint 1) |
| **E3** | Manajemen pelanggan & riwayat pemakaian | ✅ Selesai (Sprint 2) |
| **E4** | Tagihan/faktur: daftar, detail, status lunas | ✅ Selesai (Sprint 2) |
| **E5** | Pembayaran & cetak/kirim faktur (PDF) | ✅ Selesai (Sprint 3) |
| **E6** | Master data + laporan/rekap (di mobile) | ✅ Selesai (Sprint 4) |
| **E6b** | Panel admin **web** (frontend web terpisah) | ⏳ Backlog (inisiatif tersendiri) |
| **E7** | Mode offline + sinkronisasi (antrian tulis) | ✅ Selesai (Sprint 5) |
| **E7b** | Cache unduh data pelanggan untuk lookup offline | ✅ Selesai (Sprint 6) |
| **E8** | Peta konsumen (titik + status bayar + atur lokasi) | ✅ Selesai (Sprint 7) |

## 5. Ruang lingkup Sprint 2 (E3 + E4)

**Termasuk:**
- Daftar pelanggan dengan pencarian & pagination.
- Detail pelanggan + riwayat catatan meter (grafik/angka pemakaian).
- Daftar tagihan/faktur dengan filter (periode, status lunas) + detail faktur.

**Tidak termasuk (sengaja ditunda):**
- Proses pembayaran/pelunasan (E5).
- Cetak/kirim PDF (E5).
- Edit master pelanggan (E6).

## 6. Asumsi & batasan

- Skema MySQL `pdam` **tidak diubah** (entity menyesuaikan, `synchronize:false`).
- Mobile selalu lewat API (tidak pernah konek MySQL langsung).
- Password lama plaintext → ditangani auth backward-compatible (lihat ADR-002).
- `customer.barcode` banyak kosong → resolusi scan fleksibel (barcode→id).
