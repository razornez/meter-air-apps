import { BadRequestException, Body, Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common';
import { FakturService } from './faktur.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ListFakturDto } from './dto/list-faktur.dto';
import { PaymentDto } from './dto/payment.dto';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('faktur')
export class FakturController {
  constructor(private readonly faktur: FakturService) {}

  @Post('payment')
  payment(@CurrentUser() user: AuthUser, @Request() req, @Body() dto: PaymentDto) {
    return this.faktur.setLunas(dto.noFaktur, dto.lunas ?? true, user.id, req.tenantId, dto.reason);
  }

  @Get('payments')
  payments(@Request() req, @Query('noFaktur') noFaktur: string) {
    if (!noFaktur) throw new BadRequestException('noFaktur wajib diisi');
    return this.faktur.listPayments(noFaktur, req.tenantId);
  }

  @Get('detail')
  detail(@Request() req, @Query('noFaktur') noFaktur: string) {
    if (!noFaktur) throw new BadRequestException('noFaktur wajib diisi');
    return this.faktur.detail(noFaktur, req.tenantId);
  }

  @Get()
  list(@Request() req, @Query() dto: ListFakturDto) {
    return this.faktur.list(dto, req.tenantId);
  }
}
