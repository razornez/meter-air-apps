import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faktur } from '../meter/entities/faktur.entity';
import { Transaksi } from '../meter/entities/transaksi.entity';
import { Customer } from '../customers/entities/customer.entity';
import { HistoryMeter } from '../meter/entities/history-meter.entity';
import { normalizeMonthlyRow, RawMonthlyRow } from './reports.util';
import { AnomalyType, detectUsageAnomaly } from './anomaly.util';

const MAX_MONTHS = 24;

export interface AnomalyItem {
  customerId: number;
  nama: string | null;
  alamat: string | null;
  type: AnomalyType;
  severity: 'tinggi' | 'sedang';
  latest: number;
  rata: number;
  rasio: number;
  alasan: string;
  lastMeter: number;
  tanggal: string;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Faktur) private readonly faktur: Repository<Faktur>,
    @InjectRepository(Transaksi)
    private readonly transaksi: Repository<Transaksi>,
    @InjectRepository(Customer)
    private readonly customers: Repository<Customer>,
    @InjectRepository(HistoryMeter)
    private readonly history: Repository<HistoryMeter>,
  ) {}

  // S8-01 — daftar pelanggan dengan pemakaian janggal (deteksi rule-based).
  async anomalies(limit = 100) {
    const rows = await this.history
      .createQueryBuilder('h')
      .select('h.id_pelanggan', 'idPelanggan')
      .addSelect('h.meter', 'meter')
      .addSelect('h.tanggal_catat', 'tanggal')
      .orderBy('h.id_pelanggan', 'ASC')
      .addOrderBy('h.id', 'ASC')
      .getRawMany<{
        idPelanggan: number | string;
        meter: number | string;
        tanggal: string;
      }>();

    // Kelompokkan pembacaan per pelanggan (sudah urut lama→baru).
    const byCust = new Map<number, { meter: number; tanggal: string }[]>();
    for (const r of rows) {
      const id = Number(r.idPelanggan);
      const arr = byCust.get(id) ?? [];
      arr.push({ meter: Number(r.meter), tanggal: String(r.tanggal) });
      byCust.set(id, arr);
    }

    // Peta id → nama/alamat (sekali query).
    const custRows = await this.customers
      .createQueryBuilder('c')
      .select(['c.id', 'c.nama', 'c.alamat'])
      .getMany();
    const custMap = new Map(custRows.map((c) => [c.id, c]));

    const out: AnomalyItem[] = [];
    for (const [id, series] of byCust) {
      if (series.length < 2) continue;
      const usages: number[] = [];
      for (let i = 1; i < series.length; i++) {
        usages.push(Math.max(0, series[i].meter - series[i - 1].meter));
      }
      const a = detectUsageAnomaly(usages);
      if (!a) continue;
      const last = series[series.length - 1];
      const c = custMap.get(id);
      out.push({
        customerId: id,
        nama: c?.nama ?? null,
        alamat: c?.alamat ?? null,
        type: a.type,
        severity: a.severity,
        latest: a.latest,
        rata: Math.round(a.rata * 10) / 10,
        rasio: Math.round(a.rasio * 10) / 10,
        alasan: a.alasan,
        lastMeter: last.meter,
        tanggal: last.tanggal,
      });
    }

    out.sort(
      (a, b) =>
        (a.severity === 'tinggi' ? 0 : 1) - (b.severity === 'tinggi' ? 0 : 1) ||
        b.rasio - a.rasio,
    );
    return out.slice(0, Math.min(limit, 500));
  }

  // S4-00 — ringkasan KPI bulan & tahun berjalan.
  async summary() {
    const now = new Date();
    const m = now.getMonth() + 1;
    const y = now.getFullYear();

    const totalPelanggan = await this.customers.count();

    const agg = await this.faktur
      .createQueryBuilder('f')
      .select('COUNT(f.id)', 'jumlahFaktur')
      .addSelect('COALESCE(SUM(f.total),0)', 'totalTagihan')
      .addSelect(
        'COALESCE(SUM(CASE WHEN f.is_lunas=1 THEN f.total ELSE 0 END),0)',
        'totalTerbayar',
      )
      .where('MONTH(f.tanggal) = :m AND YEAR(f.tanggal) = :y', { m, y })
      .getRawOne<{
        jumlahFaktur: string;
        totalTagihan: string;
        totalTerbayar: string;
      }>();

    const usage = await this.transaksi
      .createQueryBuilder('t')
      .innerJoin(Faktur, 'f', 'f.no_faktur = t.faktur')
      .select('COALESCE(SUM(CAST(t.quantity AS UNSIGNED)),0)', 'pemakaian')
      .where('MONTH(f.tanggal) = :m AND YEAR(f.tanggal) = :y', { m, y })
      .getRawOne<{ pemakaian: string }>();

    const totalTagihan = Number(agg?.totalTagihan ?? 0);
    const totalTerbayar = Number(agg?.totalTerbayar ?? 0);

    return {
      totalPelanggan,
      bulanIni: {
        periode: `${y}-${String(m).padStart(2, '0')}`,
        jumlahFaktur: Number(agg?.jumlahFaktur ?? 0),
        totalTagihan,
        totalTerbayar,
        totalBelum: totalTagihan - totalTerbayar,
        pemakaianM3: Number(usage?.pemakaian ?? 0),
      },
    };
  }

  // S4-00 — rekap per bulan (terbaru dulu).
  async monthly(months = 6) {
    const take = Math.min(Math.max(months, 1), MAX_MONTHS);
    const rows = await this.faktur
      .createQueryBuilder('f')
      .select("DATE_FORMAT(f.tanggal,'%Y-%m')", 'periode')
      .addSelect('COUNT(f.id)', 'jumlahFaktur')
      .addSelect('COALESCE(SUM(f.total),0)', 'totalTagihan')
      .addSelect(
        'COALESCE(SUM(CASE WHEN f.is_lunas=1 THEN f.total ELSE 0 END),0)',
        'totalTerbayar',
      )
      .where('f.tanggal IS NOT NULL')
      .groupBy('periode')
      .orderBy('periode', 'DESC')
      .limit(take)
      .getRawMany<RawMonthlyRow>();

    return rows.map(normalizeMonthlyRow);
  }
}
