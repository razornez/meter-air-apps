-- Migrasi E8: koordinat pelanggan untuk peta (aditif, non-destruktif).
-- Jalankan: mysql -u root pdam < refactor/api/migrations/003_add_customer_coords.sql

ALTER TABLE `customer`
  ADD COLUMN `latitude`  DECIMAL(10,7) DEFAULT NULL,
  ADD COLUMN `longitude` DECIMAL(10,7) DEFAULT NULL;
