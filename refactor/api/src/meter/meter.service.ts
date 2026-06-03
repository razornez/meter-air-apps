import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Faktur } from './entities/faktur.entity';
import { HistoryMeter } from './entities/history-meter.entity';
import { Transaksi } from './entities/transaksi.entity';
import { TariffService } from './tariff.service';
import { CustomersService } from '../customers/customers.service';
import {
  dueDate20th,
  fakturTotal,
  fotoMeterName,
  nextFakturNumber,
} from './faktur.util';

// Konstanta dari kode lama (Transaksi::save_meter).
const BEBAN = 5000; // biaya beban tetap per tagihan
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
  ) {
    this.waterBarcode = this.config.get<string>(
      'WATER_PRODUCT_BARCODE',
      'B1502200001',
    );
  }

  // Preview rincian tarif tanpa menyimpan.
  calculate(tipe: string, pemakaian: number) {
    return this.tariff.calculate(tipe, pemakaian);
  }

  // Ambil nomor faktur terakhir (untuk hitung counter berikutnya).
  private async lastFakturNumber(): Promise<string | null> {
    const last = await this.faktur.findOne({
      where: {},
      order: { id: 'DESC' },
    });
    return last?.noFaktur ?? null;
  }

  /**
   * Simpan catatan meter → buat faktur + history_meter + transaksi (atomik).
   * Port dari Transaksi::save_meter, dirapikan & dibuat transaksional.
   */
  async saveReading(
    kasirId: number,
    customerId: number,
    meterBaru: number,
    catatan?: string,
  ) {
    const info = await this.customersService.meterInfo(customerId);

    if (info.alreadyRecordedThisMonth) {
      throw new ConflictException(
        'Data meter bulan ini sudah diinput sebelumnya.',
      );
    }

    const meterLama = info.lastMeter;
    let pemakaian = meterBaru - meterLama;
    if (pemakaian < 0) pemakaian = 0;

    const tipe = info.customer.tipe ?? '';
    const tariff = await this.tariff.calculate(tipe, pemakaian);

    const subtotal = tariff.totalBiaya;
    const total = fakturTotal(subtotal, BEBAN);

    const now = new Date();
    const noFaktur = nextFakturNumber(await this.lastFakturNumber(), now);
    const fotoMeter = fotoMeterName(noFaktur, customerId);
    const dueDate = dueDate20th(now);

    const tanggalCatat = now.toISOString().slice(0, 10);
    const jamCatat = now.toTimeString().slice(0, 8);

    await this.dataSource.transaction(async (manager) => {
      await manager.insert(Faktur, {
        noFaktur,
        tanggal: now,
        kasir: kasirId,
        subtotal,
        beban: BEBAN,
        denda: DENDA,
        diskon: 0,
        ppn: 0,
        biayaKirim: 0,
        total,
        diskonTipe: 'rp',
        customer: String(customerId),
        tglJatuhTempo: dueDate,
        fotoMeter,
        catatan: catatan ?? 'tidak ada',
        isDone: 1,
        isLunas: 0,
      });

      await manager.insert(HistoryMeter, {
        idPelanggan: customerId,
        meter: meterBaru,
        noFaktur,
        tanggalCatat,
        jamCatat,
      });

      await manager.insert(Transaksi, {
        barcode: this.waterBarcode,
        produk: 'Pemakaian Air',
        harga: 0,
        quantity: String(pemakaian),
        diskon: '0',
        total: subtotal,
        faktur: noFaktur,
      });
    });

    return {
      noFaktur,
      customerId,
      tipe,
      meterLama,
      meterBaru,
      pemakaian,
      rincian: tariff.posts,
      subtotal,
      beban: BEBAN,
      total,
      tglJatuhTempo: dueDate,
      fotoMeter,
    };
  }

  // Lampirkan/timpa foto meter ke faktur yang sudah ada.
  async attachPhotoFilename(noFaktur: string): Promise<Faktur> {
    const f = await this.faktur.findOne({ where: { noFaktur } });
    if (!f) throw new NotFoundException('Faktur tidak ditemukan');
    return f;
  }
}
