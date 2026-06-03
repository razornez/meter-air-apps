import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { Customer } from './entities/customer.entity';
import { HistoryMeter } from '../meter/entities/history-meter.entity';
import { Faktur } from '../meter/entities/faktur.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, HistoryMeter, Faktur])],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}
