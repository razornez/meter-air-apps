import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ListQueryDto } from './dto/list-query.dto';

@UseGuards(JwtAuthGuard)
@Controller()
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('produk')
  produk(@Query() dto: ListQueryDto) {
    return this.catalog.listProduk(dto);
  }

  @Get('supplier')
  supplier(@Query() dto: ListQueryDto) {
    return this.catalog.listSupplier(dto);
  }
}
