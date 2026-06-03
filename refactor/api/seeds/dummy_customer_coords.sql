-- SEED (data DUMMY): isi koordinat acak untuk pelanggan yang belum punya titik,
-- tersebar di sekitar Kiangroke, Kab. Bandung (~±2.2 km dari pusat).
-- Aman dijalankan ulang (hanya mengisi yang masih NULL).
--
-- Jalankan: mysql -u root pdam < refactor/api/seeds/dummy_customer_coords.sql
--
-- CATATAN: ini koordinat dummy untuk demo peta. Ganti dengan koordinat asli
-- (GPS petugas / impor) saat data nyata tersedia.

UPDATE `customer`
SET
  `latitude`  = ROUND(-7.0210  + (RAND() - 0.5) * 0.040, 7),
  `longitude` = ROUND(107.5810 + (RAND() - 0.5) * 0.040, 7)
WHERE `latitude` IS NULL OR `longitude` IS NULL;
