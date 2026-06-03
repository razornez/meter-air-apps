import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { CustomersModule } from './customers/customers.module';
import { MeterModule } from './meter/meter.module';
import { FakturModule } from './faktur/faktur.module';
import { ConfigAppModule } from './app-config/config-app.module';
import { ReportsModule } from './reports/reports.module';
import { CatalogModule } from './catalog/catalog.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Rate limit global: 120 request / menit / IP (anti penyalahgunaan/brute-force).
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST', 'localhost'),
        port: parseInt(config.get('DB_PORT', '3306'), 10),
        username: config.get('DB_USERNAME', 'root'),
        password: config.get('DB_PASSWORD', ''),
        database: config.get('DB_DATABASE', 'pdam'),
        autoLoadEntities: true,
        // Database `pdam` sudah ada — JANGAN biarkan TypeORM mengubah skema.
        synchronize: false,
        charset: 'latin1_swedish_ci',
      }),
    }),
    AuthModule,
    CustomersModule,
    MeterModule,
    FakturModule,
    ConfigAppModule,
    ReportsModule,
    CatalogModule,
  ],
  providers: [
    // Terapkan rate limit ke seluruh endpoint.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
