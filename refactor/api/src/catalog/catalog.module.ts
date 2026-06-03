import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogService } from './catalog.service';
import { CatalogController } from './catalog.controller';
import { Produk } from './entities/produk.entity';
import { Supplier } from './entities/supplier.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Produk, Supplier])],
  controllers: [CatalogController],
  providers: [CatalogService],
})
export class CatalogModule {}
