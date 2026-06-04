import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as MidtransClient from 'midtrans-client';
import { Faktur } from '../meter/entities/faktur.entity';
import { Transaksi } from '../meter/entities/transaksi.entity';
import { ActivityLog } from '../auth/entities/activity-log.entity';
import { Pembayaran } from '../faktur/entities/pembayaran.entity';
import { Customer } from '../customers/entities/customer.entity';

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
  ) {
    const isProduction = config.get('MIDTRANS_IS_PRODUCTION', 'false') === 'true';
    this.serverKey = config.get('MIDTRANS_SERVER_KEY', '');
    this.snap = new MidtransClient.Snap({
      isProduction,
      serverKey: this.serverKey,
      clientKey: config.get('MIDTRANS_CLIENT_KEY', ''),
    });
  }

  // Buat Snap transaction token untuk sebuah faktur.
  async createSnapToken(noFaktur: string, kasirId: number) {
    const f = await this.faktur.findOne({ where: { noFaktur } });
    if (!f) throw new NotFoundException('Faktur tidak ditemukan');
    if (f.isLunas === 1) {
      return { alreadyPaid: true, token: null, redirectUrl: null };
    }

    const customerId = f.customer ? Number(f.customer) : null;
    const cust = customerId
      ? await this.customers.findOne({ where: { id: customerId } })
      : null;

    // Midtrans: gross_amount WAJIB sama persis dengan sum(item_details).
    // Kolom `denda` di DB tidak selalu masuk ke `total` (sistem lama),
    // sehingga subtotal+beban+denda ≠ total. Pakai 1 item = total agar selalu cocok.
    const total = Math.round(f.total ?? 0); // Midtrans butuh integer
    if (total <= 0) {
      throw new Error(`Total faktur tidak valid: ${total}`);
    }

    const orderId = `${noFaktur.replace(/\//g, '-')}-${Date.now()}`;

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: total,
      },
      customer_details: {
        first_name: (cust?.nama ?? 'Pelanggan').slice(0, 255),
        phone: (cust?.telp ?? '').replace(/[^0-9+]/g, '').slice(0, 19) || undefined,
      },
      item_details: [
        {
          id: 'tagihan-air',
          price: total,
          quantity: 1,
          name: `Tagihan Air - ${noFaktur}`,
        },
      ],
      // Metadata agar webhook tahu faktur mana yang dilunasi
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

    return {
      alreadyPaid: false,
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
      orderId,
    };
  }

  // Verifikasi notifikasi webhook dari Midtrans dan tandai lunas.
  async handleWebhook(body: Record<string, string>) {
    const {
      order_id,
      transaction_status,
      fraud_status,
      custom_field1: noFaktur,
      custom_field2: kasirIdStr,
      gross_amount,
      signature_key,
      status_code,
    } = body;

    // Verifikasi signature (SHA-512: orderId+statusCode+grossAmount+serverKey)
    const crypto = await import('crypto');
    const expected = crypto
      .createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${this.serverKey}`)
      .digest('hex');

    if (signature_key !== expected) {
      this.logger.warn(`Webhook signature tidak valid untuk order ${order_id}`);
      return { ok: false, reason: 'invalid_signature' };
    }

    // Hanya proses pembayaran yang berhasil
    const paid =
      (transaction_status === 'capture' && fraud_status === 'accept') ||
      transaction_status === 'settlement';

    if (!paid) {
      this.logger.log(`Webhook ${order_id}: status ${transaction_status} — diabaikan`);
      return { ok: true, paid: false };
    }

    if (!noFaktur) {
      this.logger.warn(`Webhook ${order_id}: custom_field1 (noFaktur) kosong`);
      return { ok: false, reason: 'missing_no_faktur' };
    }

    const f = await this.faktur.findOne({ where: { noFaktur } });
    if (!f || f.isLunas === 1) {
      return { ok: true, paid: false, reason: 'already_paid_or_not_found' };
    }

    const kasirId = kasirIdStr ? Number(kasirIdStr) : 0;
    const dibayar = f.total ?? 0;

    await this.dataSource.transaction(async (mgr) => {
      await mgr.update(Faktur, { id: f.id }, { isLunas: 1 });
      await mgr.update(Transaksi, { faktur: noFaktur }, { dibayar });
    });

    await this.logs.insert({
      idUser: kasirId,
      aktivitas: `Pembayaran Midtrans berhasil — ${noFaktur} (order: ${order_id})`,
      jenis: 'pembayaran',
      waktu: new Date(),
    }).catch(() => {/* best-effort */});

    await this.pembayaran.insert({
      noFaktur,
      jumlah: dibayar,
      tipe: 'lunas',
      idUser: kasirId || null,
      waktu: new Date(),
    }).catch(() => {/* best-effort */});

    this.logger.log(`✅ Faktur ${noFaktur} ditandai lunas via Midtrans`);
    return { ok: true, paid: true, noFaktur };
  }
}
