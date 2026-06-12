import { Body, Controller, Get, Header, Headers, Post, Query, Req, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';

@Controller('payment')
export class PaymentController {
  constructor(private readonly payment: PaymentService) {}

  @UseGuards(JwtAuthGuard)
  @Get('methods')
  getMethods() {
    return this.payment.getMethods();
  }

  @UseGuards(JwtAuthGuard)
  @Post('pay')
  pay(@Body('noFaktur') noFaktur: string, @Body('methodCode') methodCode: string, @CurrentUser() user: AuthUser, @Req() req: { tenantId: number }) {
    return this.payment.pay(noFaktur, methodCode, user.id, req.tenantId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('snap-token')
  snapToken(@Body('noFaktur') noFaktur: string, @CurrentUser() user: AuthUser, @Req() req: { tenantId: number }) {
    return this.payment.createKasugaiPayment(noFaktur, user.id, req.tenantId);
  }

  // Buat order utk halaman /checkout hosted kasugai (widget metode bayar). App buka checkoutUrl.
  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  checkout(@Body('noFaktur') noFaktur: string, @CurrentUser() user: AuthUser, @Req() req: { tenantId: number }) {
    return this.payment.createCheckoutOrder(noFaktur, user.id, req.tenantId);
  }

  // Konfirmasi aktif: app panggil ini saat Snap sukses → backend cek status ke kasugai
  // & tandai lunas SEKETIKA (tak menunggu webhook). Aman: status diverifikasi ke gateway.
  @UseGuards(JwtAuthGuard)
  @Post('confirm')
  confirm(@Body('noFaktur') noFaktur: string, @Req() req: { tenantId: number }) {
    return this.payment.confirmPayment(noFaktur, req.tenantId);
  }

  @SkipThrottle()
  @Post('webhook')
  webhook(@Req() req: { rawBody?: Buffer }, @Headers('x-kasugai-signature') sig: string) {
    const raw = req.rawBody ?? Buffer.alloc(0);
    return this.payment.handleWebhook(raw, sig ?? '');
  }

  // Publik (tanpa auth): tujuan redirect Midtrans/kasugai setelah bayar.
  // WebView app menangkap URL ini lalu menutup; halaman ini fallback bila ter-load.
  @SkipThrottle()
  @Get('return')
  @Header('Content-Type', 'text/html; charset=utf-8')
  paymentReturn(@Query('transaction_status') status?: string, @Query('status_code') statusCode?: string) {
    return this.payment.returnPageHtml(status ?? statusCode);
  }
}
