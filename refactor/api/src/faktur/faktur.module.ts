import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FakturService } from './faktur.service';
import { FakturController } from './faktur.controller';
import { Faktur } from '../meter/entities/faktur.entity';
import { Transaksi } from '../meter/entities/transaksi.entity';
import { HistoryMeter } from '../meter/entities/history-meter.entity';
import { Customer } from '../customers/entities/customer.entity';
import { ActivityLog } from '../auth/entities/activity-log.entity';
import { Pembayaran } from './entities/pembayaran.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Faktur,
      Transaksi,
      HistoryMeter,
      Customer,
      ActivityLog,
      Pembayaran,
    ]),
  ],
  controllers: [FakturController],
  providers: [FakturService],
})
export class FakturModule {}
