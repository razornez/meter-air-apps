-- Migrasi TD-5: tabel riwayat pembayaran (aditif, non-destruktif).
-- Jalankan SEKALI sebelum mengaktifkan fitur riwayat pembayaran:
--   mysql -u root pdam < refactor/api/migrations/001_create_pembayaran.sql
--
-- Tabel ini menyimpan jejak pelunasan/pembatalan per faktur (jumlah, tipe,
-- petugas, waktu). Tidak mengubah tabel lama.

CREATE TABLE IF NOT EXISTS `pembayaran` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `no_faktur` VARCHAR(25) NOT NULL,
  `jumlah` INT(15) NOT NULL DEFAULT 0,
  `tipe` VARCHAR(10) NOT NULL DEFAULT 'lunas',   -- 'lunas' | 'batal'
  `id_user` INT(11) DEFAULT NULL,
  `waktu` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pembayaran_no_faktur` (`no_faktur`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
