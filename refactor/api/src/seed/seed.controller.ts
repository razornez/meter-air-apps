import { Controller, ForbiddenException, Post, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SkipThrottle } from '@nestjs/throttler';
import { SeedService } from './seed.service';

@SkipThrottle()
@Controller('seed')
export class SeedController {
  constructor(
    private readonly seed: SeedService,
    private readonly config: ConfigService,
    @InjectDataSource() private readonly db: DataSource,
  ) {}

  private checkSecret(secret: string) {
    const expected = this.config.get<string>('SEED_SECRET', 'seed-meterair-demo-2025');
    if (secret !== expected) throw new ForbiddenException('Invalid seed secret');
  }

  @Post('demo')
  async demo(@Query('secret') secret: string, @Query('tenant') tenant = '1') {
    this.checkSecret(secret);
    return this.seed.seedDemo(Number(tenant));
  }

  // POST /api/seed/cleanup?secret=XXX — hapus semua data demo (SED/) sekarang
  @Post('cleanup')
  async cleanup(@Query('secret') secret: string) {
    this.checkSecret(secret);
    return this.seed.cleanupDemo();
  }

  // POST /api/seed/migrate?secret=XXX — buat tabel meter_photo (foto BLOB) sekali saja
  @Post('migrate')
  async migrate(@Query('secret') secret: string) {
    this.checkSecret(secret);
    const sql = `
      CREATE TABLE IF NOT EXISTS meter_photo (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        tenant_id INT UNSIGNED NOT NULL DEFAULT 1,
        no_faktur VARCHAR(50) NOT NULL,
        mime VARCHAR(40) NOT NULL DEFAULT 'image/jpeg',
        data LONGBLOB NOT NULL,
        created_at DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_meter_photo_faktur (no_faktur),
        KEY idx_meter_photo_tenant (tenant_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=latin1`;
    try {
      await this.db.query(sql);
      return { ok: true, table: 'meter_photo created/verified' };
    } catch (e: any) {
      return { ok: false, error: e.message };
    }
  }

  // POST /api/seed/indexes?secret=XXX — pasang DB indexes sekali saja
  @Post('indexes')
  async indexes(@Query('secret') secret: string) {
    this.checkSecret(secret);
    const stmts = [
      'ALTER TABLE faktur ADD INDEX IF NOT EXISTS idx_faktur_tanggal (tanggal)',
      'ALTER TABLE faktur ADD INDEX IF NOT EXISTS idx_faktur_tenant_tgl (tenant_id, tanggal)',
      'ALTER TABLE faktur ADD INDEX IF NOT EXISTS idx_faktur_customer (customer)',
      'ALTER TABLE faktur ADD INDEX IF NOT EXISTS idx_faktur_is_lunas (is_lunas)',
      'ALTER TABLE history_meter ADD INDEX IF NOT EXISTS idx_hm_pelanggan (id_pelanggan)',
      'ALTER TABLE history_meter ADD INDEX IF NOT EXISTS idx_hm_tenant_pelanggan (tenant_id, id_pelanggan)',
      'ALTER TABLE history_meter ADD INDEX IF NOT EXISTS idx_hm_no_faktur (no_faktur)',
      'ALTER TABLE pelanggan ADD INDEX IF NOT EXISTS idx_pel_barcode (barcode)',
      'ALTER TABLE pelanggan ADD INDEX IF NOT EXISTS idx_pel_tenant_nama (tenant_id, nama)',
    ];
    const results: string[] = [];
    for (const sql of stmts) {
      try { await this.db.query(sql); results.push(`OK: ${sql.split('ADD INDEX')[1]?.trim()}`); }
      catch (e: any) { results.push(`ERR: ${e.message}`); }
    }
    return { applied: results };
  }
}
