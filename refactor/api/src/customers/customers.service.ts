import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { HistoryMeter } from '../meter/entities/history-meter.entity';
import { Faktur } from '../meter/entities/faktur.entity';
import { ListCustomersDto } from './dto/list-customers.dto';
import { mapUsageHistory, RawReading } from './meter-history.util';

const MAX_LIMIT = 100;

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customers: Repository<Customer>,
    @InjectRepository(HistoryMeter)
    private readonly history: Repository<HistoryMeter>,
    @InjectRepository(Faktur)
    private readonly faktur: Repository<Faktur>,
  ) {}

  async findById(id: number): Promise<Customer> {
    const c = await this.customers.findOne({ where: { id } });
    if (!c) throw new NotFoundException('Pelanggan tidak ditemukan');
    return c;
  }

  // S2-01 — daftar pelanggan dengan pencarian & pagination.
  async list(dto: ListCustomersDto) {
    const page = dto.page ?? 1;
    const limit = Math.min(dto.limit ?? 20, MAX_LIMIT);

    const qb = this.customers
      .createQueryBuilder('c')
      .orderBy('c.nama', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    if (dto.search) {
      qb.where(
        'c.nama LIKE :s OR c.alamat LIKE :s OR CAST(c.id AS CHAR) LIKE :s',
        { s: `%${dto.search}%` },
      );
    }

    const [rows, total] = await qb.getManyAndCount();
    return {
      data: rows.map((c) => ({
        id: c.id,
        nama: c.nama,
        alamat: c.alamat,
        tipe: c.tipe,
        barcode: c.barcode,
      })),
      total,
      page,
      limit,
    };
  }

  // S2-02 — detail lengkap pelanggan + info meter.
  async detail(id: number) {
    const c = await this.findById(id);
    const [lastMeter, alreadyRecorded] = await Promise.all([
      this.lastMeter(id),
      this.alreadyRecordedThisMonth(id),
    ]);
    return {
      id: c.id,
      nama: c.nama,
      alamat: c.alamat,
      tipe: c.tipe,
      kota: c.kota,
      rt: c.rt,
      rw: c.rw,
      telp: c.telp,
      barcode: c.barcode,
      lastMeter,
      alreadyRecordedThisMonth: alreadyRecorded,
    };
  }

  // S2-02 — riwayat catatan meter + pemakaian antar pembacaan.
  async meterHistory(id: number, limit = 24) {
    await this.findById(id); // 404 bila tidak ada
    const take = Math.min(limit, MAX_LIMIT);
    const rows = await this.history.find({
      where: { idPelanggan: id },
      order: { id: 'DESC' },
      take,
    });
    const raw: RawReading[] = rows.map((r) => ({
      id: r.id,
      meter: r.meter,
      tanggalCatat: String(r.tanggalCatat),
      jamCatat: String(r.jamCatat),
      noFaktur: r.noFaktur,
    }));
    return mapUsageHistory(raw);
  }

  // Dipakai setelah scan QR meter pada aplikasi mobile.
  async findByBarcode(barcode: string): Promise<Customer> {
    const c = await this.customers.findOne({ where: { barcode } });
    if (!c) {
      throw new NotFoundException(
        `Pelanggan dengan barcode "${barcode}" tidak ditemukan`,
      );
    }
    return c;
  }

  /**
   * Resolusi kode hasil scan QR yang fleksibel: coba cocokkan ke `barcode`,
   * lalu fallback ke `id` numerik. Berguna selama barcode pelanggan belum
   * sepenuhnya terisi (data lama belum punya barcode).
   */
  async resolveScannedCode(code: string): Promise<Customer> {
    const byBarcode = await this.customers.findOne({
      where: { barcode: code },
    });
    if (byBarcode) return byBarcode;

    if (/^\d+$/.test(code)) {
      const byId = await this.customers.findOne({
        where: { id: parseInt(code, 10) },
      });
      if (byId) return byId;
    }

    throw new NotFoundException(
      `Pelanggan untuk kode "${code}" tidak ditemukan`,
    );
  }

  // Angka meter terakhir yang tercatat untuk pelanggan ini.
  async lastMeter(customerId: number): Promise<number> {
    const row = await this.history.findOne({
      where: { idPelanggan: customerId },
      order: { id: 'DESC' },
    });
    return row?.meter ?? 0;
  }

  // Port dari Mcustomer::isCheckMeter — apakah sudah ada faktur bulan & tahun ini.
  async alreadyRecordedThisMonth(customerId: number): Promise<boolean> {
    const now = new Date();
    const count = await this.faktur
      .createQueryBuilder('f')
      .where('f.customer = :cid', { cid: String(customerId) })
      .andWhere('MONTH(f.tanggal) = :m', { m: now.getMonth() + 1 })
      .andWhere('YEAR(f.tanggal) = :y', { y: now.getFullYear() })
      .getCount();
    return count > 0;
  }

  // Ringkasan untuk layar input meter di mobile.
  async meterInfo(customerId: number) {
    const customer = await this.findById(customerId);
    const [lastMeter, alreadyRecorded] = await Promise.all([
      this.lastMeter(customerId),
      this.alreadyRecordedThisMonth(customerId),
    ]);
    return {
      customer: {
        id: customer.id,
        nama: customer.nama,
        alamat: customer.alamat,
        tipe: customer.tipe,
        barcode: customer.barcode,
      },
      lastMeter,
      alreadyRecordedThisMonth: alreadyRecorded,
    };
  }
}
