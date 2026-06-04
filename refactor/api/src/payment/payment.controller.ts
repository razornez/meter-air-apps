import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';

@Controller('payment')
export class PaymentController {
  constructor(private readonly payment: PaymentService) {}

  // Buat Snap token — pakai POST+body agar noFaktur dengan '/' tidak double-encoded.
  @UseGuards(JwtAuthGuard)
  @Post('snap-token')
  snapToken(
    @Body('noFaktur') noFaktur: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.payment.createSnapToken(noFaktur, user.id);
  }

  // Webhook Midtrans — tidak pakai JWT (Midtrans tidak kirim token kita).
  // Keamanan dijamin via signature_key verification di service.
  @Post('webhook')
  webhook(@Body() body: Record<string, string>) {
    return this.payment.handleWebhook(body);
  }
}
