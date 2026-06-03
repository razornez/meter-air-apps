import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FakturService } from './faktur.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ListFakturDto } from './dto/list-faktur.dto';
import { PaymentDto } from './dto/payment.dto';
import {
  AuthUser,
  CurrentUser,
} from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('faktur')
export class FakturController {
  constructor(private readonly faktur: FakturService) {}

  // S3-01 — tandai lunas / batal lunas (noFaktur via body karena memuat '/').
  @Post('payment')
  payment(@CurrentUser() user: AuthUser, @Body() dto: PaymentDto) {
    return this.faktur.setLunas(dto.noFaktur, dto.lunas ?? true, user.id);
  }

  // S2-03 — detail tagihan. noFaktur memuat '/', maka dikirim sebagai query
  // (di-encode klien) untuk menghindari masalah %2F pada path.
  @Get('detail')
  detail(@Query('noFaktur') noFaktur: string) {
    if (!noFaktur) throw new BadRequestException('noFaktur wajib diisi');
    return this.faktur.detail(noFaktur);
  }

  // S2-03 — daftar tagihan (filter periode/status + pagination).
  @Get()
  list(@Query() dto: ListFakturDto) {
    return this.faktur.list(dto);
  }
}
