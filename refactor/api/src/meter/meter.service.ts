import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Faktur } from './entities/faktur.entity';
import { HistoryMeter } from './entities/history-meter.entity';
import { Transaksi } from './entities/transaksi.entity';
import { MeterPhoto } from './entities/meter-photo.entity';
import { TariffService } from './tariff.service';
import { CustomersService } from '../customers/customers.service';
import { dueDate20th, fakturTotal, fotoMeterName, nextFakturNumber } from './faktur.util';

const BEBAN = 5000;
const DENDA = 0;

@Injectable()
export class MeterService {
  private readonly waterBarcode: string;

  constructor(
    private readonly dataSource: DataSource,
    private readonly tariff: TariffService,
    private readonly customersService: CustomersService,
    private readonly config: ConfigService,
    @InjectRepository(Faktur) private readonly faktur: Repository<Faktur>,
    @InjectRepository(MeterPhoto) private readonly photos: Repository<MeterPhoto>,
  ) {
    this.waterBarcode = this.config.get<string>('WATER_PRODUCT_BARCODE', 'B1502200001');
  }

  calculate(tipe: string, pemakaian: number) {
    return this.tariff.calculate(tipe, pemakaian);
  }

  private async lastFakturNumber(tenantId: number): Promise<string | null> {
    const last = await this.faktur.findOne({ where: { tenantId }, order: { id: 'DESC' } });
    return last?.noFaktur ?? null;
  }

  async saveReading(kasirId: number, customerId: number, meterBaru: number, catatan: string | undefined, tenantId: number) {
    const info = await this.customersService.meterInfo(customerId, tenantId);

    if (info.alreadyRecordedThisMonth) {
      throw new ConflictException('Data meter bulan ini sudah diinput sebelumnya.');
    }

    const meterLama = info.lastMeter;
    let pemakaian = meterBaru - meterLama;
    if (pemakaian < 0) pemakaian = 0;

    const tipe = info.customer.tipe ?? '';
    const tariff = await this.tariff.calculate(tipe, pemakaian, tenantId);

    const subtotal = tariff.totalBiaya;
    const total = fakturTotal(subtotal, BEBAN);

    const now = new Date();
    const noFaktur = nextFakturNumber(await this.lastFakturNumber(tenantId), now);
    const fotoMeter = fotoMeterName(noFaktur, customerId);
    const dueDate = dueDate20th(now);
    const tanggalCatat = now.toISOString().slice(0, 10);
    const jamCatat = now.toTimeString().slice(0, 8);

    await this.dataSource.transaction(async (manager) => {
      await manager.insert(Faktur, {
        tenantId, noFaktur, tanggal: now, kasir: kasirId,
        subtotal, beban: BEBAN, denda: DENDA, diskon: 0, ppn: 0, biayaKirim: 0, total,
        diskonTipe: 'rp', customer: String(customerId), tglJatuhTempo: dueDate,
        fotoMeter, catatan: catatan ?? 'tidak ada', isDone: 1, isLunas: 0,
      });
      await manager.insert(HistoryMeter, {
        tenantId, idPelanggan: customerId, meter: meterBaru, noFaktur, tanggalCatat, jamCatat,
      });
      await manager.insert(Transaksi, {
        tenantId, barcode: this.waterBarcode, produk: 'Pemakaian Air',
        harga: 0, quantity: pemakaian, diskon: 0, total: subtotal, faktur: noFaktur,
      });
    });

    return { noFaktur, customerId, tipe, meterLama, meterBaru, pemakaian, rincian: tariff.posts, subtotal, beban: BEBAN, total, tglJatuhTempo: dueDate, fotoMeter };
  }

  async attachPhotoFilename(noFaktur: string, tenantId: number): Promise<Faktur> {
    const f = await this.faktur.findOne({ where: { noFaktur, tenantId } });
    if (!f) throw new NotFoundException('Faktur tidak ditemukan');
    return f;
  }

  /** Simpan/replace foto bukti meteran sebagai BLOB di DB (upsert per faktur). */
  async savePhoto(noFaktur: string, tenantId: number, data: Buffer, mime: string): Promise<void> {
    const existing = await this.photos.findOne({ where: { noFaktur } });
    if (existing) {
      await this.photos.update({ id: existing.id }, { data, mime, tenantId });
    } else {
      await this.photos.save({ noFaktur, tenantId, data, mime, createdAt: new Date() });
    }
  }

  /** Ambil BLOB foto untuk disajikan. Publik (lihat MeterPhotoController). */
  async getPhoto(noFaktur: string): Promise<MeterPhoto | null> {
    return this.photos.findOne({ where: { noFaktur } });
  }
}
