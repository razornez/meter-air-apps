-- Indexes untuk query performa pada database meterair
-- Jalankan sekali di Railway MySQL console
-- Semua menggunakan IF NOT EXISTS agar aman dijalankan berulang

-- faktur: query worklist (MONTH/YEAR filter + tenant + customer)
ALTER TABLE faktur
  ADD INDEX IF NOT EXISTS idx_faktur_tanggal      (tanggal),
  ADD INDEX IF NOT EXISTS idx_faktur_tenant_tgl   (tenant_id, tanggal),
  ADD INDEX IF NOT EXISTS idx_faktur_customer      (customer),
  ADD INDEX IF NOT EXISTS idx_faktur_is_lunas      (is_lunas),
  ADD INDEX IF NOT EXISTS idx_faktur_tenant_lunas  (tenant_id, is_lunas);

-- history_meter: query riwayat per pelanggan
ALTER TABLE history_meter
  ADD INDEX IF NOT EXISTS idx_hm_pelanggan         (id_pelanggan),
  ADD INDEX IF NOT EXISTS idx_hm_tenant_pelanggan  (tenant_id, id_pelanggan),
  ADD INDEX IF NOT EXISTS idx_hm_no_faktur         (no_faktur);

-- pelanggan: query resolusi barcode + list
ALTER TABLE pelanggan
  ADD INDEX IF NOT EXISTS idx_pel_barcode          (barcode),
  ADD INDEX IF NOT EXISTS idx_pel_tenant_nama      (tenant_id, nama);
