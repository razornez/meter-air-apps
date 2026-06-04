import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';

@Controller('payment')
export class PaymentController {
  constructor(private readonly payment: PaymentService) {}

  // Daftar metode pembayaran aktif dari master DB.
  @UseGuards(JwtAuthGuard)
  @Get('methods')
  getMethods() {
    return this.payment.getMethods();
  }

  // Proses pembayaran — body: { noFaktur, methodCode }
  // POST+body agar noFaktur dengan '/' tidak double-encoded di query string.
  @UseGuards(JwtAuthGuard)
  @Post('pay')
  pay(
    @Body('noFaktur') noFaktur: string,
    @Body('methodCode') methodCode: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.payment.pay(noFaktur, methodCode, user.id);
  }

  // Legacy: endpoint snap-token langsung (tetap ada untuk kompatibilitas).
  @UseGuards(JwtAuthGuard)
  @Post('snap-token')
  snapToken(
    @Body('noFaktur') noFaktur: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.payment.createSnapToken(noFaktur, user.id);
  }

  // Webhook Midtrans — tanpa JWT (Midtrans tidak kirim token kita).
  @SkipThrottle()
  @Post('webhook')
  webhook(@Body() body: Record<string, string>) {
    return this.payment.handleWebhook(body);
  }
}
