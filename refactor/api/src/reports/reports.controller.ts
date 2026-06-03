import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('summary')
  summary() {
    return this.reports.summary();
  }

  @Get('monthly')
  monthly(@Query('months') months?: string) {
    return this.reports.monthly(months ? parseInt(months, 10) : 6);
  }

  // S8-01 — daftar anomali konsumsi.
  @Get('anomalies')
  anomalies(@Query('limit') limit?: string) {
    return this.reports.anomalies(limit ? parseInt(limit, 10) : 100);
  }

  // S9-00 — worklist pencatatan (progres + belum dicatat bulan ini).
  @Get('worklist')
  worklist() {
    return this.reports.worklist();
  }

  // S10-00 — tunggakan + denda per pelanggan.
  @Get('tunggakan')
  tunggakan(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reports.tunggakan(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
    );
  }
}
