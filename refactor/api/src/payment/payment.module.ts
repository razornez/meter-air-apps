import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { Faktur } from '../meter/entities/faktur.entity';
import { Transaksi } from '../meter/entities/transaksi.entity';
import { Customer } from '../customers/entities/customer.entity';
import { ActivityLog } from '../auth/entities/activity-log.entity';
import { Pembayaran } from '../faktur/entities/pembayaran.entity';
import { PaymentMethod } from './entities/payment-method.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Faktur, Transaksi, Customer, ActivityLog, Pembayaran, PaymentMethod]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
