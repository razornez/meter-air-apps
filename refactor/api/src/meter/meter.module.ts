import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeterController } from './meter.controller';
import { MeterService } from './meter.service';
import { TariffService } from './tariff.service';
import { OcrService } from './ocr.service';
import { CustomersModule } from '../customers/customers.module';
import { Faktur } from './entities/faktur.entity';
import { HistoryMeter } from './entities/history-meter.entity';
import { Transaksi } from './entities/transaksi.entity';
import { LevelPemakaian } from './entities/level-pemakaian.entity';
import { MeterPhoto } from './entities/meter-photo.entity';
import { MeterPhotoController } from './meter-photo.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Faktur, HistoryMeter, Transaksi, LevelPemakaian, MeterPhoto]),
    CustomersModule,
  ],
  controllers: [MeterController, MeterPhotoController],
  providers: [MeterService, TariffService, OcrService],
})
export class MeterModule {}
