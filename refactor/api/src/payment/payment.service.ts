import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron } from '@nestjs/schedule';
import { Between, DataSource, Repository } from 'typeorm';
import { createHmac } from 'crypto';
import { Faktur } from '../meter/entities/faktur.entity';
import { Transaksi } from '../meter/entities/transaksi.entity';
import { ActivityLog } from '../auth/entities/activity-log.entity';
import { Pembayaran } from '../faktur/entities/pembayaran.entity';
import { Customer } from '../customers/entities/customer.entity';
import { PaymentMethod } from './entities/payment-method.entity';
import { PaymentIntent } from './entities/payment-intent.entity';

/** Status order kasugai/Midtrans yang dianggap LUNAS vs GAGAL (dipakai webhook, reconcile, confirm). */
const PAID_STATUS_RE = /paid|settle|capture|success/i;
const FAILED_STATUS_RE = /fail|expire|cancel|deny/i;

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly kasugaiBase: string;
  private readonly kasugaiSecretKey: string;
  private readonly kasugaiPublicKey: string;
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
    @InjectRepository(PaymentIntent) private readonly intents: Repository<PaymentIntent>,
  ) {
    this.kasugaiBase = config.get('KASUGAI_BASE_URL', 'http://127.0.0.1:3099');
    this.kasugaiSecretKey = config.get('KASUGAI_SECRET_KEY', '');
    this.kasugaiPublicKey = config.get('KASUGAI_PUBLIC_KEY', ''); // pk_ — utk URL checkout hosted
    this.kasugaiWebhookSecret = config.get('KASUGAI_WEBHOOK_SECRET', '');
    // finishUrl → snap-return kasugai (punya tombol "Tutup" yang benar) dengan returnUrl
    // balik ke endpoint kita. WebView native menangkap "snap-return"; web/redirect mendarat
    // di snap-return lalu diteruskan ke /api/payment/return (status-aware) kita.
    this.paymentReturnUrl = config.get(
      'PAYMENT_RETURN_URL',
      'https://kasugai.razornez.net/v1/payment/snap-return?returnUrl=https://api.meterair.online/api/payment/return',
    );
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
    if (total <= 0) throw new BadRequestException(`Total faktur tidak valid: ${total}`);

    // Sertakan tenantId di orderId ("T<id>-...") agar webhook menandai faktur tenant yang BENAR
    // (no_faktur bisa sama antar tenant, mis. tenant DEMO salinan dari real).
    const orderId = `T${tenantId}-${noFaktur.replace(/\//g, '-')}-${Date.now()}`;
    const kasugaiMethod = 'midtrans_qris'; // saat ini gateway hanya pakai Snap Midtrans
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
    const payData = await payRes.json() as { redirectUrl?: string; token?: string; snapToken?: string; clientKey?: string };

    this.logger.log(`kasugai payment created: ${noFaktur} orderId=${orderId} amount=${total}`);
    // Catat intent untuk REKONSILIASI (jaring pengaman bila webhook terlewat).
    await this.intents.insert({ tenantId, orderId, noFaktur, amount: total, status: 'pending' })
      .catch((e) => this.logger.warn(`payment_intent insert gagal (${orderId}): ${String(e)}`));
    return {
      alreadyPaid: false,
      token: payData.token ?? payData.snapToken ?? null,
      redirectUrl: payData.redirectUrl ?? null,
      clientKey: payData.clientKey ?? null, // utk Snap.js in-app popup di web
      orderId,
    };
  }

  /**
   * Buat order kasugai SAJA untuk halaman /checkout hosted (widget metode bayar kasugai).
   * Halaman checkout yang memanggil /pay + Snap secara internal — kita TAK memanggil /pay.
   * Status lunas tetap dari webhook (sumber kebenaran). Mengembalikan URL checkout siap dibuka.
   */
  async createCheckoutOrder(noFaktur: string, _kasirId: number, tenantId: number) {
    const f = await this.faktur.findOne({ where: { noFaktur, tenantId } });
    if (!f) throw new NotFoundException(`Faktur ${noFaktur} tidak ditemukan`);
    if (f.isLunas === 1) return { alreadyPaid: true, orderId: null, amount: 0, checkoutUrl: null };

    const total = Math.round(f.total ?? 0);
    if (total <= 0) throw new BadRequestException(`Total faktur tidak valid: ${total}`);

    const customerId = f.customer ? Number(f.customer) : null;
    const cust = customerId ? await this.customers.findOne({ where: { id: customerId, tenantId } }) : null;

    // orderId ber-prefix T<tenantId> agar webhook/reconcile menandai faktur tenant yang benar.
    const orderId = `T${tenantId}-${noFaktur.replace(/\//g, '-')}-${Date.now()}`;
    const orderRes = await fetch(`${this.kasugaiBase}/v1/payment/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.kasugaiSecretKey}` },
      body: JSON.stringify({
        orderId,
        amount: total,
        customer: { nama: (cust?.nama ?? 'Pelanggan').slice(0, 255), telp: cust?.telp ?? undefined },
      }),
    });
    if (!orderRes.ok) {
      const err = await orderRes.text();
      this.logger.error(`checkout order error (${noFaktur}): ${err}`);
      throw new Error(`kasugai order: ${err}`);
    }

    await this.intents.insert({ tenantId, orderId, noFaktur, amount: total, status: 'pending' })
      .catch((e) => this.logger.warn(`payment_intent insert gagal (${orderId}): ${String(e)}`));

    const checkoutUrl = `${this.kasugaiBase}/checkout?publicKey=${encodeURIComponent(this.kasugaiPublicKey)}`
      + `&orderId=${encodeURIComponent(orderId)}&amount=${total}`;
    this.logger.log(`checkout order: ${noFaktur} orderId=${orderId} amount=${total}`);
    return { alreadyPaid: false, orderId, amount: total, checkoutUrl };
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    // Kasugai mengirim signature sbg HEX polos (tanpa prefix). Terima dua-duanya:
    // "<hex>" maupun "sha256=<hex>". Bandingkan case-insensitive.
    const hmacHex = createHmac('sha256', this.kasugaiWebhookSecret).update(rawBody).digest('hex');
    const got = (signature || '').replace(/^sha256=/i, '').trim().toLowerCase();

    if (got !== hmacHex.toLowerCase()) {
      this.logger.warn(`Webhook signature tidak valid (got len=${got.length}, expect len=${hmacHex.length})`);
      return { ok: false, reason: 'invalid_signature' };
    }

    const body = JSON.parse(rawBody.toString('utf8')) as Record<string, unknown>;
    const event = body['event'] as string;
    const data = body['data'] as Record<string, unknown> | undefined;
    // Cari orderId di banyak kemungkinan lokasi (data.orderId/order_id, top-level, metadata).
    const meta = (data?.['metadata'] ?? {}) as Record<string, unknown>;
    const orderId = (data?.['orderId'] ?? data?.['order_id'] ?? body['orderId'] ?? body['order_id']
      ?? meta['orderId'] ?? meta['order_id']) as string | undefined;
    this.logger.log(`Webhook: event=${event} orderId=${orderId ?? '(none)'} bodyKeys=[${Object.keys(body).join(',')}] dataKeys=[${data ? Object.keys(data).join(',') : '-'}]`);

    // Terima beragam nama event sukses (paid/settlement/capture/success).
    const paidEvent = PAID_STATUS_RE.test(event ?? '');
    if (!paidEvent) return { ok: true, paid: false, event };
    if (!orderId) { this.logger.warn('Webhook: orderId tidak ditemukan di payload'); return { ok: false, reason: 'missing_orderId' }; }

    // orderId format: "noFaktur-timestamp" (slash → dash). Balikkan.
    // orderId baru: "T<tenantId>-<noFaktur dashed>-<ts>". Lama (legacy): "<noFaktur dashed>-<ts>".
    let waTenantId: number | undefined;
    let rest = orderId;
    const tm = orderId.match(/^T(\d+)-(.+)$/);
    if (tm) { waTenantId = parseInt(tm[1], 10); rest = tm[2]; }
    const noFaktur = rest.replace(/-\d+$/, '').replace(/-/g, '/');
    const f = await this.faktur.findOne({ where: waTenantId ? { noFaktur, tenantId: waTenantId } : { noFaktur } });
    this.logger.log(`Webhook map: ${orderId} -> tenant=${waTenantId ?? '-'} noFaktur=${noFaktur} | fakturFound=${!!f} isLunas=${f?.isLunas ?? '-'}`);
    if (!f) return { ok: true, paid: false, reason: 'faktur_not_found', noFaktur };
    if (f.isLunas === 1) {
      await this.intents.update({ orderId }, { status: 'paid' }).catch(() => {});
      return { ok: true, paid: false, reason: 'already_paid', noFaktur };
    }

    const tenantId = f.tenantId ?? 1;
    await this.markFakturPaidViaKasugai(f, noFaktur, tenantId, orderId, 'webhook');
    await this.intents.update({ orderId }, { status: 'paid' }).catch(() => {});
    return { ok: true, paid: true, noFaktur };
  }

  /** Tandai faktur lunas via kasugai (dipakai webhook & rekonsiliasi). Pemanggil cek isLunas dulu. */
  private async markFakturPaidViaKasugai(f: Faktur, noFaktur: string, tenantId: number, orderId: string, source: string): Promise<void> {
    const dibayar = f.total ?? 0;
    await this.dataSource.transaction(async (mgr) => {
      await mgr.update(Faktur, { id: f.id }, { isLunas: 1 });
      await mgr.update(Transaksi, { faktur: noFaktur, tenantId }, { dibayar });
    });
    await this.logs.insert({ tenantId, idUser: 0, aktivitas: `Pembayaran kasugai berhasil — ${noFaktur} (order: ${orderId}, ${source})`, jenis: 'pembayaran', waktu: new Date() }).catch(() => {});
    await this.pembayaran.insert({ tenantId, noFaktur, metode: 'midtrans_qris', jumlah: dibayar, status: 'lunas', paidAt: new Date(), petugas: null }).catch(() => {});
    this.logger.log(`Faktur ${noFaktur} ditandai lunas via kasugai (${source})`);
  }

  /**
   * Konfirmasi AKTIF: cek status order terakhir faktur langsung ke kasugai & tandai lunas
   * seketika bila sudah dibayar. Dipanggil app saat Snap sukses → tak perlu menunggu webhook.
   * Aman: status diverifikasi ke gateway (bukan percaya klien).
   */
  async confirmPayment(noFaktur: string, tenantId: number): Promise<{ lunas: boolean; status?: string }> {
    const f = await this.faktur.findOne({ where: { noFaktur, tenantId } });
    if (!f) return { lunas: false };
    if (f.isLunas === 1) return { lunas: true };

    const intent = await this.intents.findOne({ where: { noFaktur, tenantId }, order: { createdAt: 'DESC' } });
    if (!intent) return { lunas: false };

    try {
      const res = await fetch(`${this.kasugaiBase}/v1/payment/orders/${encodeURIComponent(intent.orderId)}`, {
        headers: { Authorization: `Bearer ${this.kasugaiSecretKey}` },
      });
      if (!res.ok) return { lunas: false };
      const order = await res.json() as { status?: string };
      if (PAID_STATUS_RE.test(order.status ?? '')) {
        await this.markFakturPaidViaKasugai(f, noFaktur, tenantId, intent.orderId, 'confirm');
        await this.intents.update({ id: intent.id }, { status: 'paid' });
        return { lunas: true };
      }
      return { lunas: false, status: order.status };
    } catch {
      return { lunas: false };
    }
  }

  /**
   * REKONSILIASI: tiap 10 menit cek order 'pending' (umur 2 menit–24 jam) ke kasugai.
   * Bila status 'paid' tapi faktur belum lunas (webhook terlewat) → tandai lunas. Jaring pengaman.
   */
  @Cron('0 */10 * * * *')
  async reconcilePendingPayments(): Promise<void> {
    const now = Date.now();
    // Tandai kedaluwarsa intent pending yang sudah >24 jam (jangan dicek selamanya).
    await this.intents.createQueryBuilder().update().set({ status: 'expired' })
      .where('status = :s AND created_at < :cut', { s: 'pending', cut: new Date(now - 24 * 3600_000) })
      .execute().catch(() => {});

    const pendings = await this.intents.find({
      where: { status: 'pending', createdAt: Between(new Date(now - 24 * 3600_000), new Date(now - 2 * 60_000)) },
      take: 100,
    });
    if (!pendings.length) return;
    this.logger.log(`Reconcile: cek ${pendings.length} pembayaran pending`);

    // Paralel dgn cap konkurensi — call gateway tak lagi serial (dulu ≤100 berurutan ~menitan).
    // Tiap intent = faktur berbeda → transaksi tak saling tabrak; aman diparalelkan.
    const CONCURRENCY = 8;
    let paid = 0;
    for (let i = 0; i < pendings.length; i += CONCURRENCY) {
      const results = await Promise.all(pendings.slice(i, i + CONCURRENCY).map((it) => this.reconcileOne(it)));
      paid += results.filter(Boolean).length;
    }
    if (paid) this.logger.warn(`RECONCILE: ${paid} faktur ditandai lunas (webhook terlewat)`);
  }

  /** Proses satu intent: cek status ke kasugai → tandai lunas bila perlu. Return true bila menandai. */
  private async reconcileOne(it: PaymentIntent): Promise<boolean> {
    try {
      const res = await fetch(`${this.kasugaiBase}/v1/payment/orders/${encodeURIComponent(it.orderId)}`, {
        headers: { Authorization: `Bearer ${this.kasugaiSecretKey}` },
      });
      if (!res.ok) return false;
      const order = await res.json() as { status?: string };
      if (PAID_STATUS_RE.test(order.status ?? '')) {
        const f = await this.faktur.findOne({ where: { noFaktur: it.noFaktur ?? '', tenantId: it.tenantId } });
        let marked = false;
        if (f && f.isLunas !== 1) {
          await this.markFakturPaidViaKasugai(f, it.noFaktur ?? '', it.tenantId, it.orderId, 'reconcile');
          this.logger.warn(`RECONCILE: faktur ${it.noFaktur} ditandai lunas — webhook terlewat (order=${it.orderId})`);
          marked = true;
        }
        await this.intents.update({ id: it.id }, { status: 'paid' });
        return marked;
      }
      if (FAILED_STATUS_RE.test(order.status ?? '')) {
        await this.intents.update({ id: it.id }, { status: 'expired' });
      }
      return false;
    } catch (e) {
      this.logger.error(`Reconcile error ${it.orderId}: ${String(e)}`);
      return false;
    }
  }

  /**
   * Halaman tujuan redirect setelah bayar. WebView app native menangkap URL ini lalu
   * menutup; di web/browser halaman ini ditampilkan sesuai status transaksi Midtrans.
   */
  returnPageHtml(status?: string): string {
    const st = (status || '').toLowerCase();
    const success = /capture|settlement|success|paid/.test(st);
    const pending = /pending|deny|authorize/.test(st) && !success;
    const icon = success ? '✅' : pending ? '⏳' : '❌';
    const title = success ? 'Pembayaran Berhasil' : pending ? 'Menunggu Pembayaran' : 'Pembayaran Tidak Selesai';
    const msg = success
      ? 'Pembayaran Anda berhasil diterima. Status tagihan diperbarui otomatis.'
      : pending
        ? 'Pembayaran sedang diproses. Selesaikan lalu cek status tagihan di aplikasi.'
        : 'Pembayaran tidak selesai atau dibatalkan. Anda bisa mencoba lagi dari aplikasi.';
    const bg = success ? '#0e7490' : pending ? '#b45309' : '#b91c1c';
    return `<!doctype html><html lang="id"><head><meta charset="utf-8">`
      + `<meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>`
      + `<style>body{font-family:system-ui,sans-serif;display:flex;min-height:100vh;margin:0;align-items:center;justify-content:center;background:${bg};color:#fff;text-align:center}.c{padding:24px;max-width:360px}h1{font-size:20px;margin:10px 0}p{opacity:.9;line-height:1.5}a{display:inline-block;margin-top:18px;background:#fff;color:${bg};text-decoration:none;font-weight:700;padding:11px 22px;border-radius:12px}</style>`
      + `</head><body><div class="c"><div style="font-size:52px">${icon}</div><h1>${title}</h1>`
      + `<p>${msg}</p><a href="https://meterair.online/app/index.html">Kembali ke Aplikasi</a></div></body></html>`;
  }
}
