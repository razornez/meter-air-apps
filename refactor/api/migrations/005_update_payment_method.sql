-- Update tabel payment_method: logo color + redesign tipe + seed data baru.
-- Jalankan: mysql -u root pdam < refactor/api/migrations/005_update_payment_method.sql

-- 1. Hapus isi lama
TRUNCATE TABLE `payment_method`;

-- 2. Alter tipe ENUM (set ke VARCHAR dulu agar tidak ada konflik nilai lama)
ALTER TABLE `payment_method`
  MODIFY COLUMN `type` VARCHAR(20) NOT NULL DEFAULT 'ewallet';

-- 3. Tambah kolom baru
ALTER TABLE `payment_method`
  ADD COLUMN `logo_bg`   VARCHAR(12)  NOT NULL DEFAULT '#607D8B' AFTER `icon`,
  ADD COLUMN `logo_text` VARCHAR(12)  NOT NULL DEFAULT ''        AFTER `logo_bg`,
  ADD COLUMN `logo_url`  VARCHAR(255)          DEFAULT NULL      AFTER `logo_text`;

-- 4. Seed data lengkap
INSERT INTO `payment_method`
  (`code`,`name`,`type`,`is_active`,`icon`,`logo_bg`,`logo_text`,`logo_url`,
   `instructions`,`account_number`,`account_name`,`sort_order`)
VALUES
-- ── TUNAI
('cash','Tunai','cash',1,'','#2E7D32','CASH',NULL,
 'Terima uang langsung dari pelanggan.',NULL,NULL,1),

-- ── E-WALLET (akun perusahaan, konfirmasi manual)
('gopay','GoPay','ewallet',1,'','#00AED6','GoPay',
 'https://logowik.com/content/uploads/images/gopay4196.jpg',
 'Minta pelanggan transfer ke nomor GoPay. Konfirmasi setelah diterima.',NULL,'BUMDES Kiangroke',2),

('ovo','OVO','ewallet',1,'','#4C3494','OVO',
 'https://logowik.com/content/uploads/images/ovo-new3539.jpg',
 'Minta pelanggan transfer ke nomor OVO. Konfirmasi setelah diterima.',NULL,'BUMDES Kiangroke',3),

('dana','DANA','ewallet',1,'','#118EEA','DANA',
 'https://logowik.com/content/uploads/images/dana3576.jpg',
 'Minta pelanggan transfer ke nomor DANA. Konfirmasi setelah diterima.',NULL,'BUMDES Kiangroke',4),

('shopeepay','ShopeePay','ewallet',0,'','#F5721B','SPay',NULL,
 'Minta pelanggan transfer ke nomor ShopeePay.',NULL,'BUMDES Kiangroke',5),

-- ── TRANSFER BANK (akun perusahaan, konfirmasi manual)
('bank_bca','BCA','bank_static',1,'','#003DA5','BCA',NULL,
 'Transfer ke rekening BCA. Sertakan 3 digit terakhir no. pelanggan sebagai berita.',NULL,'BUMDES Kiangroke',6),

('bank_mandiri','Mandiri','bank_static',1,'','#F5A800','MANDIRI',NULL,
 'Transfer ke rekening Mandiri.',NULL,'BUMDES Kiangroke',7),

('bank_bni','BNI','bank_static',1,'','#E57200','BNI',NULL,
 'Transfer ke rekening BNI.',NULL,'BUMDES Kiangroke',8),

('bank_bri','BRI','bank_static',1,'','#004B8D','BRI',NULL,
 'Transfer ke rekening BRI.',NULL,'BUMDES Kiangroke',9),

-- ── GATEWAY (Midtrans — QRIS dinamis & kartu)
('midtrans_qris','QRIS (Midtrans)','midtrans',1,'','#EB1C26','QRIS',NULL,
 'QR unik per transaksi. Pelanggan scan dengan app bank/dompet.',NULL,NULL,10),

('midtrans_card','Kartu Kredit/Debit','midtrans',1,'','#1565C0','CARD',NULL,
 'Visa / Mastercard via gateway Midtrans.',NULL,NULL,11);
