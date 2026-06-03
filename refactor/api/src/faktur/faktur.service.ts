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
    @InjectRepository(Transaksi)
    private readonly transaksi: Repository<Transaksi>,
    @InjectRepository(HistoryMeter)
    private readonly history: Repository<HistoryMeter>,
    @InjectRepository(Customer)
    private readonly customers: Repository<Customer>,
    @InjectRepository(ActivityLog)
    private readonly logs: Repository<ActivityLog>,
    @InjectRepository(Pembayaran)
    private readonly pembayaran: Repository<Pembayaran>,
  ) {}

  /**
   * TD-5 — catat riwayat pembayaran (best-effort). Bila tabel `pembayaran`
   * belum dimigrasi, JANGAN gagalkan pelunasan inti — cukup catat peringatan.
   * Lihat migrasi 001_create_pembayaran.sql.
   */
  private async recordPayment(
    noFaktur: string,
    jumlah: number,
    lunas: boolean,
    userId: number,
  ) {
    try {
      await this.pembayaran.insert({
        noFaktur,
        jumlah,
        tipe: lunas ? 'lunas' : 'batal',
        idUser: userId,
        waktu: new Date(),
      });
    } catch (e) {
      this.logger.warn(
        `Gagal mencatat riwayat pembayaran untuk ${noFaktur} ` +
          `(tabel 'pembayaran' belum dimigrasi?): ${(e as Error).message}`,
      );
    }
  }

  // TD-5 — riwayat pembayaran sebuah faktur (kosong bila belum dimigrasi).
  async listPayments(noFaktur: string) {
    try {
      return await this.pembayaran.find({
        where: { noFaktur },
        order: { id: 'DESC' },
      });
    } catch {
      return [];
    }
  }

  /**
   * S3-01 — set/batal status lunas faktur. Atomik + audit ke log_aktivitas.
   * Tanpa ubah skema: pakai faktur.is_lunas & transaksi.dibayar (ADR-005).
   */
  async setLunas(noFaktur: string, lunas: boolean, userId: number) {
    const f = await this.faktur.findOne({ where: { noFaktur } });
    if (!f) throw new NotFoundException('Faktur tidak ditemukan');

    const dibayar = lunas ? f.total ?? 0 : 0;

    await this.dataSource.transaction(async (manager) => {
      await manager.update(Faktur, { id: f.id }, { isLunas: lunas ? 1 : 0 });
      await manager.update(
        Transaksi,
        { faktur: noFaktur },
        { dibayar },
      );
    });

    await this.logs.insert({
      idUser: userId,
      aktivitas: `${lunas ? 'Pelunasan' : 'Batal lunas'} faktur ${noFaktur}`,
      jenis: 'pembayaran',
      waktu: new Date(),
    });

    // Riwayat pembayaran terstruktur (best-effort; lihat TD-5).
    await this.recordPayment(noFaktur, dibayar, lunas, userId);

    return { noFaktur, isLunas: lunas, dibayar };
  }

  // Terapkan filter opsional yang sama untuk query data & count (DRY).
  private applyFilters(
    qb: SelectQueryBuilder<Faktur>,
    dto: ListFakturDto,
  ): SelectQueryBuilder<Faktur> {
    if (dto.customerId != null) {
      qb.andWhere('f.customer = :cid', { cid: String(dto.customerId) });
    }
    if (dto.month != null) {
      qb.andWhere('MONTH(f.tanggal) = :m', { m: dto.month });
    }
    if (dto.year != null) {
      qb.andWhere('YEAR(f.tanggal) = :y', { y: dto.year });
    }
    if (dto.isLunas != null) {
      qb.andWhere('f.isLunas = :l', { l: dto.isLunas });
    }
    return qb;
  }

  // S2-03 — daftar tagihan + nama pelanggan (join), dengan filter & pagination.
  async list(dto: ListFakturDto) {
    const page = dto.page ?? 1;
    const limit = Math.min(dto.limit ?? 20, MAX_LIMIT);

    const dataQb = this.applyFilters(
      this.faktur
        .createQueryBuilder('f')
        .leftJoin(Customer, 'c', 'c.id = f.customer'),
      dto,
    )
      .select('f.noFaktur', 'noFaktur')
      .addSelect('f.tanggal', 'tanggal')
      .addSelect('f.customer', 'customerId')
      .addSelect('c.nama', 'namaPelanggan')
      .addSelect('f.total', 'total')
      .addSelect('f.isLunas', 'isLunas')
      .addSelect('f.tglJatuhTempo', 'tglJatuhTempo')
      .orderBy('f.id', 'DESC')
      .offset((page - 1) * limit)
      .limit(limit);

    const rows = (await dataQb.getRawMany()) as RawFakturRow[];
    const total = await this.applyFilters(
      this.faktur.createQueryBuilder('f'),
      dto,
    ).getCount();

    return {
      data: rows.map(normalizeFakturRow),
      total,
      page,
      limit,
    };
  }

  // S2-03 — detail faktur: header + pelanggan + item transaksi + meter terkait.
  async detail(noFaktur: string) {
    const f = await this.faktur.findOne({ where: { noFaktur } });
    if (!f) throw new NotFoundException('Faktur tidak ditemukan');

    const customerId = f.customer != null ? Number(f.customer) : null;
    const [pelanggan, items, meters] = await Promise.all([
      customerId
        ? this.customers.findOne({ where: { id: customerId } })
        : Promise.resolve(null),
      this.transaksi.find({ where: { faktur: noFaktur } }),
      this.history.find({ where: { noFaktur } }),
    ]);

    return {
      noFaktur: f.noFaktur,
      tanggal: f.tanggal,
      subtotal: f.subtotal,
      beban: f.beban,
      denda: f.denda,
      total: f.total,
      isLunas: f.isLunas === 1,
      tglJatuhTempo: f.tglJatuhTempo,
      fotoMeter: f.fotoMeter,
      catatan: f.catatan,
      pelanggan: pelanggan
        ? {
            id: pelanggan.id,
            nama: pelanggan.nama,
            alamat: pelanggan.alamat,
            tipe: pelanggan.tipe,
          }
        : null,
      items: items.map((t) => ({
        produk: t.produk,
        quantity: t.quantity,
        harga: t.harga,
        total: t.total,
      })),
      meter: meters.map((m) => ({
        meter: m.meter,
        tanggal: m.tanggalCatat,
      })),
    };
  }
}
