import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { Faktur } from '../meter/entities/faktur.entity';
import { Transaksi } from '../meter/entities/transaksi.entity';
import { HistoryMeter } from '../meter/entities/history-meter.entity';
import { Customer } from '../customers/entities/customer.entity';
import { ActivityLog } from '../auth/entities/activity-log.entity';
import { Pembayaran } from './entities/pembayaran.entity';
import { PaymentIntent } from '../payment/entities/payment-intent.entity';
import { ListFakturDto } from './dto/list-faktur.dto';
import { normalizeFakturRow, RawFakturRow } from './faktur-mapper.util';

const MAX_LIMIT = 100;

// Normalisasi status pembayaran lintas-app: desktop Laravel menulis 'paid'/'pending',
// app/NestJS pakai 'lunas'/'batal'. Tanpa ini, baris 'paid' tampil "Pending" di app (BUG-01).
const PAID_RE = /paid|lunas|settle|capture|success/i;
const CANCEL_RE = /batal|cancel|void|refund|fail|expire|deny/i;
function normalizePayStatus(s: unknown): 'lunas' | 'batal' | 'pending' {
  const v = String(s ?? '');
  if (CANCEL_RE.test(v)) return 'batal';
  if (PAID_RE.test(v)) return 'lunas';
  return 'pending';
}

// Keterangan hanya bermakna sbg "alasan" untuk pembatalan. Untuk baris lunas, ref gateway
// (mis. "KASUGAI-xxxx") BUKAN alasan → jangan tampilkan sebagai alasan di riwayat.
function paymentKeterangan(rawStatus: unknown, ref: unknown): string | null {
  return normalizePayStatus(rawStatus) === 'batal' ? (ref ? String(ref) : null) : null;
}

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
    @InjectRepository(PaymentIntent) private readonly intents: Repository<PaymentIntent>,
  ) {}

  private async recordPayment(noFaktur: string, jumlah: number, lunas: boolean, userId: number, tenantId: number, reason?: string) {
    try {
      await this.pembayaran.insert({
        tenantId, noFaktur, metode: 'manual',
        jumlah, status: lunas ? 'lunas' : 'batal',
        paidAt: new Date(), petugas: userId, // selalu catat waktu aksi (termasuk batal)
        ref: reason?.trim() || null,         // alasan (terutama batal lunas) → tampil di riwayat
      });
    } catch (e) {
      this.logger.warn(`Gagal mencatat pembayaran ${noFaktur}: ${(e as Error).message}`);
    }
  }

  async listPayments(noFaktur: string, tenantId: number) {
    // Audit trail: siapa (nama petugas), metode, jumlah, status, kapan.
    try {
      const rows = await this.pembayaran
        .createQueryBuilder('p')
        .leftJoin('users', 'u', 'u.id = p.petugas')
        .select('p.id', 'id')
        .addSelect('p.metode', 'metode')
        .addSelect('p.jumlah', 'jumlah')
        .addSelect('p.status', 'status')
        .addSelect('p.paid_at', 'paidAt')
        .addSelect('p.ref', 'keterangan')
        .addSelect('u.name', 'petugasNama')
        .where('p.no_faktur = :nf AND p.tenant_id = :tid', { nf: noFaktur, tid: tenantId })
        .orderBy('p.id', 'DESC')
        .getRawMany();
      // Samakan kosakata status lintas-app + jangan jadikan ref gateway sebagai "alasan".
      return rows.map((r) => ({
        ...r,
        keterangan: paymentKeterangan(r.status, r.keterangan),
        status: normalizePayStatus(r.status),
      }));
    } catch { return []; }
  }

  async setLunas(noFaktur: string, lunas: boolean, userId: number, tenantId: number, reason?: string) {
    const f = await this.faktur.findOne({ where: { noFaktur, tenantId } });
    if (!f) throw new NotFoundException('Faktur tidak ditemukan');

    const dibayar = lunas ? f.total ?? 0 : 0;

    await this.dataSource.transaction(async (manager) => {
      await manager.update(Faktur, { id: f.id }, { isLunas: lunas ? 1 : 0 });
      await manager.update(Transaksi, { faktur: noFaktur, tenantId }, { dibayar });
    });

    // Batal lunas: void semua payment_intent agar:
    // 1. Cron rekonsiliasi tidak me-re-mark faktur jadi lunas lagi.
    // 2. Checkout berikutnya buat order BARU di Kasugai (orderId lama sudah tidak valid).
    if (!lunas) {
      await this.intents.createQueryBuilder()
        .update()
        .set({ status: 'voided' })
        .where('no_faktur = :nf AND tenant_id = :tid AND status IN (:...statuses)', {
          nf: noFaktur, tid: tenantId, statuses: ['pending', 'paid'],
        })
        .execute()
        .catch((e) => this.logger.warn(`Gagal void intents ${noFaktur}: ${String(e)}`));
    }

    const alasan = reason?.trim();
    await this.logs.insert({
      tenantId, idUser: userId,
      aktivitas: `${lunas ? 'Pelunasan' : 'Batal lunas'} faktur ${noFaktur}${alasan ? ` — alasan: ${alasan}` : ''}`,
      jenis: 'pembayaran', waktu: new Date(),
    });

    await this.recordPayment(noFaktur, dibayar, lunas, userId, tenantId, reason);
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
