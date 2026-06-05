// Fungsi murni: hitung pemakaian antar pembacaan meter. Dipisah agar mudah diuji.

export interface RawReading {
  id: number;
  meter: number;
  tanggalCatat: string;
  jamCatat: string;
  noFaktur: string;
  fotoMeter?: string | null;
  isLunas?: boolean | null;
}

export interface UsageReading {
  id: number;
  tanggal: string;
  jam: string;
  meter: number;
  pemakaian: number | null;
  noFaktur: string;
  fotoMeter: string | null;
  isLunas: boolean | null;
}

/**
 * Input: baris `history_meter` urut TERBARU dulu (desc by id).
 * Output: terbaru dulu, dengan `pemakaian` = meter − meter sebelumnya
 * (reset/negatif → 0; baris tertua → null).
 */
export function mapUsageHistory(rowsDesc: RawReading[]): UsageReading[] {
  const asc = [...rowsDesc].sort((a, b) => a.id - b.id);
  const mapped: UsageReading[] = asc.map((r, i) => ({
    id: r.id,
    tanggal: r.tanggalCatat,
    jam: r.jamCatat,
    meter: r.meter,
    noFaktur: r.noFaktur,
    pemakaian: i === 0 ? null : Math.max(0, r.meter - asc[i - 1].meter),
    fotoMeter: r.fotoMeter ?? null,
    isLunas: r.isLunas ?? null,
  }));
  return mapped.reverse();
}
