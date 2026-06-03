import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeterController } from './meter.controller';
import { MeterService } from './meter.service';
import { TariffService } from './tariff.service';
import { CustomersModule } from '../customers/customers.module';
import { Faktur } from './entities/faktur.entity';
import { HistoryMeter } from './entities/history-meter.entity';
import { Transaksi } from './entities/transaksi.entity';
import { LevelPemakaian } from './entities/level-pemakaian.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Faktur, HistoryMeter, Transaksi, LevelPemakaian]),
    CustomersModule,
  ],
  controllers: [MeterController],
  providers: [MeterService, TariffService],
})
export class MeterModule {}
