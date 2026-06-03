import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faktur } from '../meter/entities/faktur.entity';
import { Transaksi } from '../meter/entities/transaksi.entity';
import { Customer } from '../customers/entities/customer.entity';
import { normalizeMonthlyRow, RawMonthlyRow } from './reports.util';

const MAX_MONTHS = 24;

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Faktur) private readonly faktur: Repository<Faktur>,
    @InjectRepository(Transaksi)
    private readonly transaksi: Repository<Transaksi>,
    @InjectRepository(Customer)
    private readonly customers: Repository<Customer>,
  ) {}

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
