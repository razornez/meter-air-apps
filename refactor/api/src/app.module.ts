import { Controller, Get, Module } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CHANGELOG_DATA } from './changelog.data';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

@Controller()
export class HealthController {
  constructor(@InjectDataSource() private readonly db: DataSource) {}

  @Get('health')
  async check() {
    try {
      await this.db.query('SELECT 1');
      return { status: 'ok', db: 'ok', ts: new Date().toISOString() };
    } catch {
      return { status: 'degraded', db: 'error', ts: new Date().toISOString() };
    }
  }

  @SkipThrottle()
  @Get('changelog')
  getChangelog() {
    return CHANGELOG_DATA;
  }
}
import { AuthModule } from './auth/auth.module';
import { CustomersModule } from './customers/customers.module';
import { MeterModule } from './meter/meter.module';
import { FakturModule } from './faktur/faktur.module';
import { ConfigAppModule } from './app-config/config-app.module';
import { ReportsModule } from './reports/reports.module';
import { CatalogModule } from './catalog/catalog.module';
import { PaymentModule } from './payment/payment.module';
import { SeedModule } from './seed/seed.module';
import { AuditConnectionTagger } from './audit/audit-connection.tagger';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    // Rate limit global (anti penyalahgunaan/brute-force). Bisa disetel via env
    // THROTTLE_LIMIT/THROTTLE_TTL (mis. dinaikkan saat uji performa/beban).
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: parseInt(config.get('THROTTLE_TTL', '60000'), 10),
          limit: parseInt(config.get('THROTTLE_LIMIT', '120'), 10),
        },
      ],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST', 'localhost'),
        port: parseInt(config.get('DB_PORT', '3306'), 10),
        username: config.get('DB_USERNAME', 'root'),
        password: config.get('DB_PASSWORD', ''),
        database: config.get('DB_DATABASE', 'meterair'),
        autoLoadEntities: true,
        synchronize: false,
        // DB meterair (Laravel) = utf8mb4. WAJIB cocok agar nama dgn karakter
        // khusus tidak rusak (mojibake). Bisa di-override via DB_CHARSET.
        charset: config.get('DB_CHARSET', 'utf8mb4'),
        // Connection pool — Railway membatasi koneksi MySQL, jaga di bawah 10.
        // (acquireTimeout dihapus: bukan opsi mysql2 yang valid.)
        extra: {
          connectionLimit: 8,
          connectTimeout: 10000,
          waitForConnections: true,
        },
      }),
    }),
    AuthModule,
    CustomersModule,
    MeterModule,
    FakturModule,
    ConfigAppModule,
    ReportsModule,
    CatalogModule,
    PaymentModule,
    SeedModule,
  ],
  controllers: [HealthController],
  providers: [
    // Terapkan rate limit ke seluruh endpoint.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    // Tandai koneksi DB sebagai 'nest:api' untuk audit trail lintas-app.
    AuditConnectionTagger,
  ],
})
export class AppModule {}
