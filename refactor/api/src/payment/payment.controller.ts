import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
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
  pay(@Body('noFaktur') noFaktur: string, @Body('methodCode') methodCode: string, @CurrentUser() user: AuthUser, @Request() req) {
    return this.payment.pay(noFaktur, methodCode, user.id, req.tenantId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('snap-token')
  snapToken(@Body('noFaktur') noFaktur: string, @CurrentUser() user: AuthUser, @Request() req) {
    return this.payment.createSnapToken(noFaktur, user.id, req.tenantId);
  }

  @SkipThrottle()
  @Post('webhook')
  webhook(@Body() body: Record<string, string>) {
    return this.payment.handleWebhook(body);
  }
}
