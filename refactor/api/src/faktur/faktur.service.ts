import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { Faktur } from '../meter/entities/faktur.entity';
import { Transaksi } from '../meter/entities/transaksi.entity';
import { HistoryMeter } from '../meter/entities/history-meter.entity';
import { Customer } from '../customers/entities/customer.entity';
import { ActivityLog } from '../auth/entities/activity-log.entity';
import { Pembayaran } from './entities/pembayaran.entity';
import { ListFakturDto } from './dto/list-faktur.dto';
import { normalizeFakturRow, RawFakturRow } from './faktur-mapper.util';

const MAX_LIMIT = 100;

@Injectable()
export class FakturService {
  private readonly logger = new Logger(FakturService.name);

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Faktur) private readonly faktur: Repository<Faktur>,
    @InjectRepository(Transaksi) private readonly transaksi: Repository<Transaksi>,
    @InjectRepository(HistoryMeter) private readonly history: Repository<HistoryMeter>,
    @InjectRepository(Customer) private readonly customers: Repository<Customer>,
    @InjectRepository(ActivityLog) private readonly logs: Repository<ActivityLog>,
    @InjectRepository(Pembayaran) private readonly pembayaran: Repository<Pembayaran>,
  ) {}

  private async recordPayment(noFaktur: string, jumlah: number, lunas: boolean, userId: number, tenantId: number) {
    try {
      await this.pembayaran.insert({
        tenantId, noFaktur, metode: 'manual',
        jumlah, status: lunas ? 'lunas' : 'batal',
        paidAt: new Date(), petugas: userId, // selalu catat waktu aksi (termasuk batal)
      });
    } catch (e) {
      this.logger.warn(`Gagal mencatat pembayaran ${noFaktur}: ${(e as Error).message}`);
    }
  }

  async listPayments(noFaktur: string, tenantId: number) {
    // Audit trail: siapa (nama petugas), metode, jumlah, status, kapan.
    try {
      return await this.pembayaran
        .createQueryBuilder('p')
        .leftJoin('users', 'u', 'u.id = p.petugas')
        .select('p.id', 'id')
        .addSelect('p.metode', 'metode')
        .addSelect('p.jumlah', 'jumlah')
        .addSelect('p.status', 'status')
        .addSelect('p.paid_at', 'paidAt')
        .addSelect('u.name', 'petugasNama')
        .where('p.no_faktur = :nf AND p.tenant_id = :tid', { nf: noFaktur, tid: tenantId })
        .orderBy('p.id', 'DESC')
        .getRawMany();
    } catch { return []; }
  }

  async setLunas(noFaktur: string, lunas: boolean, userId: number, tenantId: number) {
    const f = await this.faktur.findOne({ where: { noFaktur, tenantId } });
    if (!f) throw new NotFoundException('Faktur tidak ditemukan');

    const dibayar = lunas ? f.total ?? 0 : 0;

    await this.dataSource.transaction(async (manager) => {
      await manager.update(Faktur, { id: f.id }, { isLunas: lunas ? 1 : 0 });
      await manager.update(Transaksi, { faktur: noFaktur, tenantId }, { dibayar });
    });

    await this.logs.insert({
      tenantId, idUser: userId,
      aktivitas: `${lunas ? 'Pelunasan' : 'Batal lunas'} faktur ${noFaktur}`,
      jenis: 'pembayaran', waktu: new Date(),
    });

    await this.recordPayment(noFaktur, dibayar, lunas, userId, tenantId);
    return { noFaktur, isLunas: lunas, dibayar };
  }

  private applyFilters(qb: SelectQueryBuilder<Faktur>, dto: ListFakturDto, tenantId: number): SelectQueryBuilder<Faktur> {
    qb.andWhere('f.tenantId = :tid', { tid: tenantId });
    if (dto.customerId != null) qb.andWhere('f.customer = :cid', { cid: String(dto.customerId) });
    if (dto.month != null) qb.andWhere('MONTH(f.tanggal) = :m', { m: dto.month });
    if (dto.year != null) qb.andWhere('YEAR(f.tanggal) = :y', { y: dto.year });
    if (dto.isLunas != null) qb.andWhere('f.isLunas = :l', { l: dto.isLunas });
    return qb;
  }

  async list(dto: ListFakturDto, tenantId: number) {
    const page = dto.page ?? 1;
    const limit = Math.min(dto.limit ?? 20, MAX_LIMIT);

    const dataQb = this.applyFilters(
      this.faktur.createQueryBuilder('f').leftJoin(Customer, 'c', 'c.id = f.customer'),
      dto, tenantId,
    )
      .select('f.noFaktur', 'noFaktur').addSelect('f.tanggal', 'tanggal')
      .addSelect('f.customer', 'customerId').addSelect('c.nama', 'namaPelanggan')
      .addSelect('f.total', 'total').addSelect('f.isLunas', 'isLunas')
      .addSelect('f.tglJatuhTempo', 'tglJatuhTempo')
      .orderBy('f.id', 'DESC').offset((page - 1) * limit).limit(limit);

    const rows = (await dataQb.getRawMany()) as RawFakturRow[];
    const total = await this.applyFilters(this.faktur.createQueryBuilder('f'), dto, tenantId).getCount();
    return { data: rows.map(normalizeFakturRow), total, page, limit };
  }

  async detail(noFaktur: string, tenantId: number) {
    const f = await this.faktur.findOne({ where: { noFaktur, tenantId } });
    if (!f) throw new NotFoundException('Faktur tidak ditemukan');

    const customerId = f.customer != null ? Number(f.customer) : null;
    const [pelanggan, items, meters] = await Promise.all([
      customerId ? this.customers.findOne({ where: { id: customerId, tenantId } }) : Promise.resolve(null),
      this.transaksi.find({ where: { faktur: noFaktur, tenantId } }),
      this.history.find({ where: { noFaktur, tenantId } }),
    ]);

    return {
      noFaktur: f.noFaktur, tanggal: f.tanggal, subtotal: f.subtotal,
      beban: f.beban, denda: f.denda, total: f.total, isLunas: f.isLunas === 1,
      tglJatuhTempo: f.tglJatuhTempo, fotoMeter: f.fotoMeter, catatan: f.catatan,
      pelanggan: pelanggan ? {
        id: pelanggan.id, nama: pelanggan.nama, alamat: pelanggan.alamat,
        tipe: pelanggan.tipe, telp: pelanggan.telp,
      } : null,
      items: items.map((t) => ({ produk: t.produk, quantity: t.quantity, harga: t.harga, total: t.total })),
      meter: meters.map((m) => ({ meter: m.meter, tanggal: m.tanggalCatat })),
    };
  }
}
