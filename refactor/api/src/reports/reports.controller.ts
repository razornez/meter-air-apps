import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('summary')
  summary(@Request() req) {
    return this.reports.summary(req.tenantId);
  }

  @Get('monthly')
  monthly(@Request() req, @Query('months') months?: string) {
    return this.reports.monthly(req.tenantId, months ? parseInt(months, 10) : 6);
  }

  @Get('anomalies')
  anomalies(@Request() req, @Query('limit') limit?: string) {
    return this.reports.anomalies(req.tenantId, limit ? parseInt(limit, 10) : 100);
  }

  @Get('worklist')
  worklist(@Request() req) {
    return this.reports.worklist(req.tenantId);
  }

  @Get('kinerja')
  kinerja(@Request() req, @Query('month') month?: string, @Query('year') year?: string) {
    return this.reports.kinerja(
      req.tenantId,
      month ? parseInt(month, 10) : undefined,
      year ? parseInt(year, 10) : undefined,
    );
  }

  @Get('tunggakan')
  tunggakan(@Request() req, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.reports.tunggakan(
      req.tenantId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
    );
  }
}
