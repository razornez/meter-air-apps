import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ListCustomersDto } from './dto/list-customers.dto';

@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customers: CustomersService) {}

  // S2-01 — daftar pelanggan (cari + pagination).
  @Get()
  list(@Query() dto: ListCustomersDto) {
    return this.customers.list(dto);
  }

  // Hasil scan QR meter → data pelanggan + info meter terakhir.
  @Get('by-barcode/:barcode')
  async byBarcode(@Param('barcode') barcode: string) {
    const customer = await this.customers.findByBarcode(barcode);
    return this.customers.meterInfo(customer.id);
  }

  // Resolusi fleksibel kode scan (barcode atau id) → info meter.
  @Get('resolve/:code')
  async resolve(@Param('code') code: string) {
    const customer = await this.customers.resolveScannedCode(code);
    return this.customers.meterInfo(customer.id);
  }

  // S6-00 — snapshot pelanggan untuk cache offline (sebelum ':id' agar tak ter-shadow).
  @Get('snapshot')
  snapshot(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.customers.snapshot(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 200,
    );
  }

  @Get(':id/last-meter')
  meterInfo(@Param('id', ParseIntPipe) id: number) {
    return this.customers.meterInfo(id);
  }

  // S2-02 — riwayat catatan meter pelanggan.
  @Get(':id/history')
  history(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit') limit?: string,
  ) {
    return this.customers.meterHistory(id, limit ? parseInt(limit, 10) : 24);
  }

  // S2-02 — detail pelanggan.
  @Get(':id')
  detail(@Param('id', ParseIntPipe) id: number) {
    return this.customers.detail(id);
  }
}
