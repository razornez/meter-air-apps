import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Produk } from './entities/produk.entity';
import { Supplier } from './entities/supplier.entity';
import { ListQueryDto } from './dto/list-query.dto';

const MAX_LIMIT = 100;

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(Produk) private readonly produk: Repository<Produk>,
    @InjectRepository(Supplier)
    private readonly supplier: Repository<Supplier>,
  ) {}

  async listProduk(dto: ListQueryDto) {
    const page = dto.page ?? 1;
    const limit = Math.min(dto.limit ?? 20, MAX_LIMIT);
    const qb = this.produk
      .createQueryBuilder('p')
      .orderBy('p.nama', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);
    if (dto.search) {
      qb.where('p.nama LIKE :s OR p.barcode LIKE :s', { s: `%${dto.search}%` });
    }
    const [rows, total] = await qb.getManyAndCount();
    return {
      data: rows.map((p) => ({
        id: p.id,
        barcode: p.barcode,
        nama: p.nama,
        satuan: p.satuan,
        hargaJual: p.hargaJual,
        stok: p.stok,
      })),
      total,
      page,
      limit,
    };
  }

  async listSupplier(dto: ListQueryDto) {
    const page = dto.page ?? 1;
    const limit = Math.min(dto.limit ?? 20, MAX_LIMIT);
    const qb = this.supplier
      .createQueryBuilder('s')
      .orderBy('s.nama', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);
    if (dto.search) {
      qb.where('s.nama LIKE :q OR s.alamat LIKE :q', { q: `%${dto.search}%` });
    }
    const [rows, total] = await qb.getManyAndCount();
    return {
      data: rows.map((s) => ({
        id: s.id,
        nama: s.nama,
        alamat: s.alamat,
        telepon: s.telepon,
      })),
      total,
      page,
      limit,
    };
  }
}
