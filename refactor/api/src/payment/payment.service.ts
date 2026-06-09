import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { createHmac } from 'crypto';
import { Faktur } from '../meter/entities/faktur.entity';
import { Transaksi } from '../meter/entities/transaksi.entity';
import { ActivityLog } from '../auth/entities/activity-log.entity';
import { Pembayaran } from '../faktur/entities/pembayaran.entity';
import { Customer } from '../customers/entities/customer.entity';
import { PaymentMethod } from './entities/payment-method.entity';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly kasugaiBase: string;
  private readonly kasugaiSecretKey: string;
  private readonly kasugaiWebhookSecret: string;
  private readonly paymentReturnUrl: string;

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
    this.kasugaiBase = config.get('KASUGAI_BASE_URL', 'http://127.0.0.1:3099');
    this.kasugaiSecretKey = config.get('KASUGAI_SECRET_KEY', '');
    this.kasugaiWebhookSecret = config.get('KASUGAI_WEBHOOK_SECRET', '');
    // URL tujuan Midtrans/kasugai redirect setelah bayar (HTTPS, dideteksi WebView app).
    this.paymentReturnUrl = config.get('PAYMENT_RETURN_URL', 'https://api.meterair.online/payment/return');
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
      case 'midtrans': return this.payKasugai(noFaktur, method, kasirId, tenantId);
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

  private async payKasugai(noFaktur: string, method: PaymentMethod, kasirId: number, tenantId: number) {
    const result = await this.createKasugaiPayment(noFaktur, kasirId, tenantId, method.code);
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

  async createKasugaiPayment(noFaktur: string, kasirId: number, tenantId: number, methodCode?: string) {
    const f = await this.faktur.findOne({ where: { noFaktur, tenantId } });
    if (!f) throw new NotFoundException('Faktur tidak ditemukan');
    if (f.isLunas === 1) return { alreadyPaid: true, token: null, redirectUrl: null };

    const customerId = f.customer ? Number(f.customer) : null;
    const cust = customerId ? await this.customers.findOne({ where: { id: customerId, tenantId } }) : null;

    const total = Math.round(f.total ?? 0);
    if (total <= 0) throw new Error(`Total faktur tidak valid: ${total}`);

    const orderId = `${noFaktur.replace(/\//g, '-')}-${Date.now()}`;
    const kasugaiMethod = methodCode === 'midtrans_qris' ? 'midtrans_qris' : 'midtrans_qris';
    const authHeader = `Bearer ${this.kasugaiSecretKey}`;

    // 1. Buat order di kasugai
    const orderRes = await fetch(`${this.kasugaiBase}/v1/payment/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
      body: JSON.stringify({
        orderId,
        amount: total,
        currency: 'IDR',
        customerName: (cust?.nama ?? 'Pelanggan').slice(0, 255),
      }),
    });
    if (!orderRes.ok) {
      const err = await orderRes.text();
      this.logger.error(`kasugai create order error (${noFaktur}): ${err}`);
      throw new Error(`kasugai order: ${err}`);
    }

    // 2. Inisiasi pembayaran
    const payRes = await fetch(`${this.kasugaiBase}/v1/payment/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
      body: JSON.stringify({ orderId, method: kasugaiMethod, finishUrl: this.paymentReturnUrl }),
    });
    if (!payRes.ok) {
      const err = await payRes.text();
      this.logger.error(`kasugai pay error (${noFaktur}): ${err}`);
      throw new Error(`kasugai pay: ${err}`);
    }
    const payData = await payRes.json() as { redirectUrl?: string; token?: string; snapToken?: string };

    this.logger.log(`kasugai payment created: ${noFaktur} orderId=${orderId} amount=${total}`);
    return {
      alreadyPaid: false,
      token: payData.token ?? payData.snapToken ?? null,
      redirectUrl: payData.redirectUrl ?? null,
      orderId,
    };
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    // Kasugai signature format: "sha256=<hex>"
    const expected = 'sha256=' + createHmac('sha256', this.kasugaiWebhookSecret)
      .update(rawBody).digest('hex');

    if (signature !== expected) {
      this.logger.warn(`Webhook signature tidak valid: got=${signature}`);
      return { ok: false, reason: 'invalid_signature' };
    }

    const body = JSON.parse(rawBody.toString('utf8')) as Record<string, unknown>;
    const event = body['event'] as string;
    const data = body['data'] as Record<string, unknown> | undefined;
    const orderId = (data?.['orderId'] ?? data?.['order_id']) as string | undefined;

    if (event !== 'payment.paid') return { ok: true, paid: false, event };
    if (!orderId) return { ok: false, reason: 'missing_orderId' };

    // orderId format: "noFaktur-timestamp"
    const noFaktur = orderId.replace(/-\d+$/, '').replace(/-/g, '/');
    const f = await this.faktur.findOne({ where: { noFaktur } });
    if (!f || f.isLunas === 1) return { ok: true, paid: false, reason: 'already_paid_or_not_found' };

    const tenantId = f.tenantId ?? 1;
    const dibayar = f.total ?? 0;

    await this.dataSource.transaction(async (mgr) => {
      await mgr.update(Faktur, { id: f.id }, { isLunas: 1 });
      await mgr.update(Transaksi, { faktur: noFaktur, tenantId }, { dibayar });
    });

    await this.logs.insert({ tenantId, idUser: 0, aktivitas: `Pembayaran kasugai berhasil — ${noFaktur} (order: ${orderId})`, jenis: 'pembayaran', waktu: new Date() }).catch(() => {});
    await this.pembayaran.insert({ tenantId, noFaktur, metode: 'midtrans_qris', jumlah: dibayar, status: 'lunas', paidAt: new Date(), petugas: null }).catch(() => {});

    this.logger.log(`Faktur ${noFaktur} ditandai lunas via kasugai`);
    return { ok: true, paid: true, noFaktur };
  }

  /** Halaman tujuan redirect setelah bayar — WebView app menangkap URL ini lalu menutup. */
  returnPageHtml(): string {
    return `<!doctype html><html lang="id"><head><meta charset="utf-8">`
      + `<meta name="viewport" content="width=device-width,initial-scale=1"><title>Pembayaran Selesai</title>`
      + `<style>body{font-family:system-ui,sans-serif;display:flex;min-height:100vh;margin:0;align-items:center;justify-content:center;background:#0e7490;color:#fff;text-align:center}div{padding:24px}h1{font-size:20px;margin:8px 0}p{opacity:.85;line-height:1.5}</style>`
      + `</head><body><div><div style="font-size:48px">✅</div><h1>Pembayaran diproses</h1>`
      + `<p>Anda bisa kembali ke aplikasi Meter Air.<br>Status tagihan diperbarui otomatis.</p></div></body></html>`;
  }
}
