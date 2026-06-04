import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as MidtransClient from 'midtrans-client';
import { Faktur } from '../meter/entities/faktur.entity';
import { Transaksi } from '../meter/entities/transaksi.entity';
import { ActivityLog } from '../auth/entities/activity-log.entity';
import { Pembayaran } from '../faktur/entities/pembayaran.entity';
import { Customer } from '../customers/entities/customer.entity';
import { PaymentMethod } from './entities/payment-method.entity';

const MIDTRANS_ENABLED: Record<string, string[]> = {
  midtrans_qris: ['other_qris', 'qris'],
  midtrans_card: ['credit_card'],
};

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly snap: MidtransClient.Snap;
  private readonly serverKey: string;

  constructor(
    private readonly config: ConfigService,
    private readonly dataSource: DataSource,
    @InjectRepository(Faktur) private readonly faktur: Repository<Faktur>,
    @InjectRepository(Transaksi) private readonly transaksi: Repository<Transaksi>,
    @InjectRepository(Customer) private readonly customers: Repository<Customer>,
    @InjectRepository(ActivityLog) private readonly logs: Repository<ActivityLog>,
    @InjectRepository(Pembayaran) private readonly pembayaran: Repository<Pembayaran>,
    @InjectRepository(PaymentMethod) private readonly methods: Repository<PaymentMethod>,
  ) {
    const isProduction = config.get('MIDTRANS_IS_PRODUCTION', 'false') === 'true';
    this.serverKey = config.get('MIDTRANS_SERVER_KEY', '');
    this.snap = new MidtransClient.Snap({
      isProduction, serverKey: this.serverKey,
      clientKey: config.get('MIDTRANS_CLIENT_KEY', ''),
    });
  }

  async getMethods() {
    return this.methods.find({ where: { isActive: 1 }, order: { sortOrder: 'ASC' } });
  }

  async pay(noFaktur: string, methodCode: string, kasirId: number, tenantId: number) {
    const method = await this.methods.findOne({ where: { code: methodCode } });
    if (!method) throw new BadRequestException(`Metode "${methodCode}" tidak ditemukan`);
    if (!method.isActive) throw new BadRequestException(`Metode "${method.name}" tidak aktif`);

    switch (method.type) {
      case 'cash': return this.payCash(noFaktur, method, kasirId, tenantId);
      case 'midtrans': return this.payMidtrans(noFaktur, method, kasirId, tenantId);
      case 'ewallet':
      case 'bank_static': return this.payTransfer(noFaktur, method, kasirId, tenantId);
      default: throw new BadRequestException(`Tipe metode tidak dikenal: ${method.type}`);
    }
  }

  private async payCash(noFaktur: string, method: PaymentMethod, kasirId: number, tenantId: number) {
    const f = await this.faktur.findOne({ where: { noFaktur, tenantId } });
    if (!f) throw new NotFoundException('Faktur tidak ditemukan');
    if (f.isLunas === 1) return { type: 'cash', alreadyPaid: true };

    const dibayar = f.total ?? 0;
    await this.dataSource.transaction(async (mgr) => {
      await mgr.update(Faktur, { id: f.id }, { isLunas: 1 });
      await mgr.update(Transaksi, { faktur: noFaktur, tenantId }, { dibayar });
    });
    await this.logs.insert({ tenantId, idUser: kasirId, aktivitas: `Bayar tunai: ${noFaktur}`, jenis: 'pembayaran', waktu: new Date() }).catch(() => {});
    await this.pembayaran.insert({ tenantId, noFaktur, metode: method.code, jumlah: dibayar, status: 'lunas', paidAt: new Date(), petugas: kasirId }).catch(() => {});
    return { type: 'cash', success: true, noFaktur, jumlah: dibayar };
  }

  private async payMidtrans(noFaktur: string, method: PaymentMethod, kasirId: number, tenantId: number) {
    const result = await this.createSnapToken(noFaktur, kasirId, tenantId, method.code);
    return { type: 'midtrans', ...result };
  }

  private async payTransfer(noFaktur: string, method: PaymentMethod, kasirId: number, tenantId: number) {
    const f = await this.faktur.findOne({ where: { noFaktur, tenantId } });
    if (!f) throw new NotFoundException('Faktur tidak ditemukan');
    if (f.isLunas === 1) return { type: 'transfer', alreadyPaid: true };
    return {
      type: 'transfer', instructions: method.instructions,
      accountNumber: method.accountNumber, accountName: method.accountName,
      amount: f.total ?? 0, noFaktur,
    };
  }

  async createSnapToken(noFaktur: string, kasirId: number, tenantId: number, methodCode?: string) {
    const f = await this.faktur.findOne({ where: { noFaktur, tenantId } });
    if (!f) throw new NotFoundException('Faktur tidak ditemukan');
    if (f.isLunas === 1) return { alreadyPaid: true, token: null, redirectUrl: null };

    const customerId = f.customer ? Number(f.customer) : null;
    const cust = customerId ? await this.customers.findOne({ where: { id: customerId, tenantId } }) : null;

    const total = Math.round(f.total ?? 0);
    if (total <= 0) throw new Error(`Total faktur tidak valid: ${total}`);

    const orderId = `${noFaktur.replace(/\//g, '-')}-${Date.now()}`;
    const enabledPayments = methodCode ? (MIDTRANS_ENABLED[methodCode] ?? []) : [];

    const parameter: Record<string, unknown> = {
      transaction_details: { order_id: orderId, gross_amount: total },
      customer_details: {
        first_name: (cust?.nama ?? 'Pelanggan').slice(0, 255),
        phone: (cust?.telp ?? '').replace(/[^0-9+]/g, '').slice(0, 19) || undefined,
      },
      item_details: [{ id: 'tagihan-air', price: total, quantity: 1, name: `Tagihan Air - ${noFaktur}` }],
      ...(enabledPayments.length > 0 && { enabled_payments: enabledPayments }),
      custom_field1: noFaktur,
      custom_field2: String(kasirId),
    };

    this.logger.log(`Snap token request: ${noFaktur} gross_amount=${total}`);
    let transaction: { token: string; redirect_url: string };
    try {
      transaction = await this.snap.createTransaction(parameter);
    } catch (err: any) {
      const detail = err?.ApiResponse ?? err?.message ?? String(err);
      this.logger.error(`Midtrans error (${noFaktur}): ${JSON.stringify(detail)}`);
      throw new Error(`Midtrans: ${JSON.stringify(detail)}`);
    }

    return { alreadyPaid: false, token: transaction.token, redirectUrl: transaction.redirect_url, orderId };
  }

  async handleWebhook(body: Record<string, string>) {
    const { order_id, transaction_status, fraud_status, custom_field1: noFaktur, custom_field2: kasirIdStr, gross_amount, signature_key, status_code } = body;

    const crypto = await import('crypto');
    const expected = crypto.createHash('sha512').update(`${order_id}${status_code}${gross_amount}${this.serverKey}`).digest('hex');

    if (signature_key !== expected) {
      this.logger.warn(`Webhook signature tidak valid untuk order ${order_id}`);
      return { ok: false, reason: 'invalid_signature' };
    }

    const paid = (transaction_status === 'capture' && fraud_status === 'accept') || transaction_status === 'settlement';
    if (!paid) return { ok: true, paid: false };
    if (!noFaktur) return { ok: false, reason: 'missing_no_faktur' };

    // Cari faktur tanpa filter tenantId (webhook tidak bawa tenantId)
    const f = await this.faktur.findOne({ where: { noFaktur } });
    if (!f || f.isLunas === 1) return { ok: true, paid: false, reason: 'already_paid_or_not_found' };

    const tenantId = f.tenantId ?? 1;
    const kasirId = kasirIdStr ? Number(kasirIdStr) : 0;
    const dibayar = f.total ?? 0;

    await this.dataSource.transaction(async (mgr) => {
      await mgr.update(Faktur, { id: f.id }, { isLunas: 1 });
      await mgr.update(Transaksi, { faktur: noFaktur, tenantId }, { dibayar });
    });

    await this.logs.insert({ tenantId, idUser: kasirId, aktivitas: `Pembayaran Midtrans berhasil — ${noFaktur} (order: ${order_id})`, jenis: 'pembayaran', waktu: new Date() }).catch(() => {});
    await this.pembayaran.insert({ tenantId, noFaktur, metode: 'midtrans', jumlah: dibayar, status: 'lunas', paidAt: new Date(), petugas: kasirId || null }).catch(() => {});

    this.logger.log(`Faktur ${noFaktur} ditandai lunas via Midtrans`);
    return { ok: true, paid: true, noFaktur };
  }
}
