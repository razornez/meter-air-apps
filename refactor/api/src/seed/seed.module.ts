import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from '../customers/entities/customer.entity';
import { Faktur } from '../meter/entities/faktur.entity';
import { HistoryMeter } from '../meter/entities/history-meter.entity';
import { MeterPhoto } from '../meter/entities/meter-photo.entity';
import { Tenant } from '../auth/entities/tenant.entity';
import { SeedController } from './seed.controller';
import { SeedService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, Faktur, HistoryMeter, MeterPhoto, Tenant])],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
