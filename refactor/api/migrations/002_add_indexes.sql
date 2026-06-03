-- Migrasi performa: index untuk mempercepat query (aditif, non-destruktif).
-- Jalankan: mysql -u root pdam < refactor/api/migrations/002_add_indexes.sql
--
-- Mempercepat: snapshot/meter-terakhir/riwayat (history_meter per pelanggan),
-- detail faktur & rekap (transaksi per faktur), daftar faktur per pelanggan.

-- history_meter: lookup & MAX(id) per pelanggan
ALTER TABLE `history_meter` ADD INDEX `idx_hm_id_pelanggan` (`id_pelanggan`);

-- transaksi: join per faktur (detail faktur, rekap pemakaian)
ALTER TABLE `transaksi` ADD INDEX `idx_trx_faktur` (`faktur`);

-- faktur: filter per pelanggan (daftar tagihan, cek catatan bulan ini)
ALTER TABLE `faktur` ADD INDEX `idx_faktur_customer` (`customer`);

-- faktur: urut/agregasi berdasar tanggal (rekap)
ALTER TABLE `faktur` ADD INDEX `idx_faktur_tanggal` (`tanggal`);
