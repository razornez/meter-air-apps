import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

/**
 * Menandai setiap koneksi pool MySQL milik NestJS dengan @audit_user='nest:api'.
 *
 * Trigger audit_data (di sisi DB/Laravel) membaca @audit_user untuk kolom `changed_by`,
 * sehingga semua tulisan dari API/mobile tercatat sebagai berasal dari 'nest:api'
 * — membedakannya dari tulisan Laravel ('laravel:<id>').
 *
 * Aman: di-hook ke event 'connection' pool (mysql2) → berlaku untuk SEMUA koneksi
 * pool sepanjang umurnya (pool-safe). Semua dibungkus guard; bila gagal, tak ada
 * efek ke operasi DB normal.
 */
@Injectable()
export class AuditConnectionTagger implements OnApplicationBootstrap {
  private readonly logger = new Logger(AuditConnectionTagger.name);

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  onApplicationBootstrap(): void {
    try {
      const pool: any = (this.dataSource.driver as any).pool;
      if (pool && typeof pool.on === 'function') {
        // Koneksi baru yang dibuat pool ke depan.
        pool.on('connection', (conn: any) => {
          try {
            conn.query("SET @audit_user = 'nest:api'");
          } catch {
            /* abaikan — penandaan audit tak boleh mengganggu koneksi */
          }
        });
      }
      // Koneksi yang mungkin sudah terbuka saat bootstrap.
      this.dataSource.query("SET @audit_user = 'nest:api'").catch(() => undefined);
      this.logger.log('Audit connection tagger aktif (@audit_user=nest:api)');
    } catch (e) {
      this.logger.warn('Audit connection tagger gagal dipasang (diabaikan): ' + String(e));
    }
  }
}
