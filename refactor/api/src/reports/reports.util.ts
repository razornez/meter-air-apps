// Fungsi murni normalisasi baris rekap bulanan (mudah diuji).

export interface RawMonthlyRow {
  periode: string;
  jumlahFaktur: string | number;
  totalTagihan: string | number | null;
  totalTerbayar: string | number | null;
}

export interface MonthlyReport {
  periode: string;
  jumlahFaktur: number;
  totalTagihan: number;
  totalTerbayar: number;
  totalBelum: number;
}

export function normalizeMonthlyRow(r: RawMonthlyRow): MonthlyReport {
  const totalTagihan = Number(r.totalTagihan ?? 0);
  const totalTerbayar = Number(r.totalTerbayar ?? 0);
  return {
    periode: r.periode,
    jumlahFaktur: Number(r.jumlahFaktur ?? 0),
    totalTagihan,
    totalTerbayar,
    totalBelum: totalTagihan - totalTerbayar,
  };
}
