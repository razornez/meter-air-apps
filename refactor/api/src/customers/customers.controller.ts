import {
  Body, Controller, Get, Param, ParseIntPipe, Patch, Query, Request, UseGuards,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ListCustomersDto } from './dto/list-customers.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customers: CustomersService) {}

  @Get()
  list(@Request() req, @Query() dto: ListCustomersDto) {
    return this.customers.list(dto, req.tenantId);
  }

  @Get('by-barcode/:barcode')
  async byBarcode(@Request() req, @Param('barcode') barcode: string) {
    const customer = await this.customers.findByBarcode(barcode, req.tenantId);
    return this.customers.meterInfo(customer.id, req.tenantId);
  }

  @Get('resolve/:code')
  async resolve(@Request() req, @Param('code') code: string) {
    const customer = await this.customers.resolveScannedCode(code, req.tenantId);
    return this.customers.meterInfo(customer.id, req.tenantId);
  }

  @Get('snapshot')
  snapshot(@Request() req, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.customers.snapshot(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 200,
      req.tenantId,
    );
  }

  @Get('map')
  map(@Request() req) {
    return this.customers.mapMarkers(req.tenantId);
  }

  @Patch(':id/location')
  updateLocation(@Request() req, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLocationDto) {
    return this.customers.updateLocation(id, dto.latitude, dto.longitude, req.tenantId);
  }

  @Get(':id/last-meter')
  meterInfo(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.customers.meterInfo(id, req.tenantId);
  }

  @Get(':id/history')
  history(@Request() req, @Param('id', ParseIntPipe) id: number, @Query('limit') limit?: string) {
    return this.customers.meterHistory(id, limit ? parseInt(limit, 10) : 24, req.tenantId);
  }

  @Get(':id')
  detail(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.customers.detail(id, req.tenantId);
  }
}
