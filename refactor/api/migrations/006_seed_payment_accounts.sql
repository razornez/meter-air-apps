-- Seed nomor rekening & e-wallet perusahaan (data DUMMY — ganti dengan data asli).
-- Jalankan: mysql -u root pdam < refactor/api/migrations/006_seed_payment_accounts.sql
--
-- PENTING: Ganti nomor-nomor di bawah dengan nomor rekening & e-wallet perusahaan yang asli!
-- Bisa diubah kapan saja via phpMyAdmin atau:
--   UPDATE payment_method SET account_number='NOMOR_BARU' WHERE code='gopay';

UPDATE `payment_method` SET
  `account_number` = '0812-3456-7890',
  `account_name`   = 'BUMDES Kiangroke 2016'
WHERE `code` = 'gopay';

UPDATE `payment_method` SET
  `account_number` = '0821-4567-8901',
  `account_name`   = 'BUMDES Kiangroke 2016'
WHERE `code` = 'ovo';

UPDATE `payment_method` SET
  `account_number` = '0831-5678-9012',
  `account_name`   = 'BUMDES Kiangroke 2016'
WHERE `code` = 'dana';

UPDATE `payment_method` SET
  `account_number` = '0851-6789-0123',
  `account_name`   = 'BUMDES Kiangroke 2016'
WHERE `code` = 'shopeepay';

-- BCA: 10 digit
UPDATE `payment_method` SET
  `account_number` = '1234 5678 90',
  `account_name`   = 'BUMDES KIANGROKE 2016',
  `is_active`      = 1
WHERE `code` = 'bank_bca';

-- Mandiri: 13 digit
UPDATE `payment_method` SET
  `account_number` = '1400 0123 4567',
  `account_name`   = 'BUMDES KIANGROKE 2016',
  `is_active`      = 1
WHERE `code` = 'bank_mandiri';

-- BNI: 10 digit
UPDATE `payment_method` SET
  `account_number` = '0123 4567 89',
  `account_name`   = 'BUMDES KIANGROKE 2016',
  `is_active`      = 1
WHERE `code` = 'bank_bni';

-- BRI: format 15 digit
UPDATE `payment_method` SET
  `account_number` = '0123-01-012345-30-6',
  `account_name`   = 'BUMDES KIANGROKE 2016',
  `is_active`      = 1
WHERE `code` = 'bank_bri';
