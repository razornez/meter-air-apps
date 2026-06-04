import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { HistoryMeter } from '../meter/entities/history-meter.entity';
import { Faktur } from '../meter/entities/faktur.entity';
import { ListCustomersDto } from './dto/list-customers.dto';
import { mapUsageHistory, RawReading } from './meter-history.util';
import { normalizeSnapshotRow, RawSnapshotRow } from './snapshot.util';
import { mapCustomerMarkerRow, RawMarkerRow } from './map.util';

const MAX_LIMIT = 100;
const MAX_SNAPSHOT_LIMIT = 1000;

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

  async findById(id: number, tenantId: number): Promise<Customer> {
    const c = await this.customers.findOne({ where: { id, tenantId } });
    if (!c) throw new NotFoundException('Pelanggan tidak ditemukan');
    return c;
  }

  async list(dto: ListCustomersDto, tenantId: number) {
    const page = dto.page ?? 1;
    const limit = Math.min(dto.limit ?? 20, MAX_LIMIT);
    const qb = this.customers
      .createQueryBuilder('c')
      .where('c.tenantId = :tid', { tid: tenantId })
      .orderBy('c.nama', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);
    if (dto.search) {
      qb.andWhere(
        'c.nama LIKE :s OR c.alamat LIKE :s OR CAST(c.id AS CHAR) LIKE :s',
        { s: `%${dto.search}%` },
      );
    }
    const [rows, total] = await qb.getManyAndCount();
    return {
      data: rows.map((c) => ({ id: c.id, nama: c.nama, alamat: c.alamat, tipe: c.tipe, barcode: c.barcode })),
      total, page, limit,
    };
  }

  async detail(id: number, tenantId: number) {
    const c = await this.findById(id, tenantId);
    const [lastMeter, alreadyRecorded] = await Promise.all([
      this.lastMeter(id, tenantId),
      this.alreadyRecordedThisMonth(id, tenantId),
    ]);
    return {
      id: c.id, nama: c.nama, alamat: c.alamat, tipe: c.tipe, kota: c.kota,
      rt: c.rt, rw: c.rw, telp: c.telp, barcode: c.barcode, lastMeter,
      alreadyRecordedThisMonth: alreadyRecorded, latitude: c.latitude, longitude: c.longitude,
    };
  }

  async snapshot(page = 1, limit = 200, tenantId: number) {
    const take = Math.min(Math.max(limit, 1), MAX_SNAPSHOT_LIMIT);
    const total = await this.customers.count({ where: { tenantId } });
    const rows = (await this.customers
      .createQueryBuilder('c')
      .leftJoin(
        'history_meter', 'lm',
        'lm.id_pelanggan = c.id AND lm.id = (SELECT MAX(h.id) FROM history_meter h WHERE h.id_pelanggan = c.id AND h.tenant_id = c.tenant_id)',
      )
      .where('c.tenantId = :tid', { tid: tenantId })
      .select('c.id', 'id').addSelect('c.nama', 'nama').addSelect('c.alamat', 'alamat')
      .addSelect('c.tipe', 'tipe').addSelect('c.barcode', 'barcode')
      .addSelect('COALESCE(lm.meter, 0)', 'lastMeter')
      .orderBy('c.id', 'ASC').offset((page - 1) * take).limit(take)
      .getRawMany()) as RawSnapshotRow[];
    return { data: rows.map(normalizeSnapshotRow), total, page, limit: take };
  }

  async mapMarkers(tenantId: number) {
    const rows = (await this.customers
      .createQueryBuilder('c')
      .leftJoin(
        (qb) => qb
          .select('f2.customer', 'customer').addSelect('MAX(f2.id)', 'maxid')
          .from(Faktur, 'f2').where('f2.tenantId = :tid', { tid: tenantId }).groupBy('f2.customer'),
        'mx', 'mx.customer = c.id',
      )
      .leftJoin(Faktur, 'f', 'f.id = mx.maxid')
      .where('c.tenantId = :tid AND c.latitude IS NOT NULL AND c.longitude IS NOT NULL', { tid: tenantId })
      .select('c.id', 'id').addSelect('c.nama', 'nama').addSelect('c.alamat', 'alamat')
      .addSelect('c.latitude', 'lat').addSelect('c.longitude', 'lng')
      .addSelect('f.is_lunas', 'isLunas').addSelect('f.no_faktur', 'noFaktur')
      .getRawMany()) as RawMarkerRow[];
    return rows.map(mapCustomerMarkerRow);
  }

  async updateLocation(id: number, latitude: number, longitude: number, tenantId: number) {
    await this.findById(id, tenantId);
    await this.customers.update({ id, tenantId }, { latitude, longitude });
    return { id, latitude, longitude };
  }

  async meterHistory(id: number, limit = 24, tenantId: number) {
    await this.findById(id, tenantId);
    const take = Math.min(limit, MAX_LIMIT);
    const rows = await this.history.find({
      where: { idPelanggan: id, tenantId }, order: { id: 'DESC' }, take,
    });
    const raw: RawReading[] = rows.map((r) => ({
      id: r.id, meter: r.meter,
      tanggalCatat: String(r.tanggalCatat), jamCatat: String(r.jamCatat), noFaktur: r.noFaktur,
    }));
    return mapUsageHistory(raw);
  }

  async findByBarcode(barcode: string, tenantId: number): Promise<Customer> {
    const c = await this.customers.findOne({ where: { barcode, tenantId } });
    if (!c) throw new NotFoundException(`Pelanggan dengan barcode "${barcode}" tidak ditemukan`);
    return c;
  }

  async resolveScannedCode(code: string, tenantId: number): Promise<Customer> {
    const byBarcode = await this.customers.findOne({ where: { barcode: code, tenantId } });
    if (byBarcode) return byBarcode;
    if (/^\d+$/.test(code)) {
      const byId = await this.customers.findOne({ where: { id: parseInt(code, 10), tenantId } });
      if (byId) return byId;
    }
    throw new NotFoundException(`Pelanggan untuk kode "${code}" tidak ditemukan`);
  }

  async lastMeter(customerId: number, tenantId: number): Promise<number> {
    const row = await this.history.findOne({
      where: { idPelanggan: customerId, tenantId }, order: { id: 'DESC' },
    });
    return row?.meter ?? 0;
  }

  async alreadyRecordedThisMonth(customerId: number, tenantId: number): Promise<boolean> {
    const now = new Date();
    const count = await this.faktur
      .createQueryBuilder('f')
      .where('f.customer = :cid AND f.tenantId = :tid', { cid: String(customerId), tid: tenantId })
      .andWhere('MONTH(f.tanggal) = :m', { m: now.getMonth() + 1 })
      .andWhere('YEAR(f.tanggal) = :y', { y: now.getFullYear() })
      .getCount();
    return count > 0;
  }

  async meterInfo(customerId: number, tenantId: number) {
    const customer = await this.findById(customerId, tenantId);
    const [lastMeter, alreadyRecorded] = await Promise.all([
      this.lastMeter(customerId, tenantId),
      this.alreadyRecordedThisMonth(customerId, tenantId),
    ]);
    return {
      customer: { id: customer.id, nama: customer.nama, alamat: customer.alamat, tipe: customer.tipe, barcode: customer.barcode },
      lastMeter, alreadyRecordedThisMonth: alreadyRecorded,
    };
  }
}
