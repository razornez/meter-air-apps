-- Migrasi: tabel master metode pembayaran (aditif).
-- Jalankan: mysql -u root pdam < refactor/api/migrations/004_add_payment_method.sql

CREATE TABLE IF NOT EXISTS `payment_method` (
  `id`             INT(11) NOT NULL AUTO_INCREMENT,
  `code`           VARCHAR(30)  NOT NULL UNIQUE,
  `name`           VARCHAR(100) NOT NULL,
  `type`           ENUM('cash','midtrans','transfer') NOT NULL DEFAULT 'cash',
  `is_active`      TINYINT(1)   NOT NULL DEFAULT 1,
  `icon`           VARCHAR(10)  NOT NULL DEFAULT '💳',
  `instructions`   TEXT         DEFAULT NULL,
  `account_number` VARCHAR(50)  DEFAULT NULL,
  `account_name`   VARCHAR(100) DEFAULT NULL,
  `sort_order`     INT(11)      NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed data awal
INSERT INTO `payment_method`
  (`code`, `name`, `type`, `is_active`, `icon`, `instructions`, `account_number`, `account_name`, `sort_order`)
VALUES
  ('cash',             'Tunai',            'cash',      1, '💵', 'Bayar langsung kepada petugas di lokasi.',           NULL, NULL, 1),
  ('midtrans_qris',    'QRIS',             'midtrans',  1, '📱', 'Scan QR dengan aplikasi bank atau dompet digital.',  NULL, NULL, 2),
  ('midtrans_gopay',   'GoPay',            'midtrans',  1, '🟢', 'Bayar via GoPay melalui aplikasi Gojek.',            NULL, NULL, 3),
  ('midtrans_ovo',     'OVO',              'midtrans',  1, '🟣', 'Bayar via OVO.',                                     NULL, NULL, 4),
  ('midtrans_dana',    'DANA',             'midtrans',  1, '🔵', 'Bayar via DANA.',                                    NULL, NULL, 5),
  ('midtrans_bni',     'Transfer BNI VA',  'midtrans',  1, '🏦', 'Transfer via Virtual Account BNI.',                  NULL, NULL, 6),
  ('midtrans_bca',     'Transfer BCA VA',  'midtrans',  1, '🏦', 'Transfer via Virtual Account BCA.',                  NULL, NULL, 7),
  ('transfer_manual',  'Transfer Manual',  'transfer',  1, '🔀', 'Transfer ke rekening perusahaan. Konfirmasi ke petugas setelah transfer.', NULL, NULL, 8)
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`);
