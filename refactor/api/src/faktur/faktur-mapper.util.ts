// Normalisasi baris faktur mentah (hasil query) ke bentuk respons rapi.
// Murni & deterministik → mudah diuji.

export interface RawFakturRow {
  noFaktur: string | null;
  tanggal: Date | string | null;
  customerId: string | null;
  namaPelanggan: string | null;
  total: number | string | null;
  isLunas: number | string | null;
  tglJatuhTempo: string | null;
}

export interface FakturListItem {
  noFaktur: string | null;
  tanggal: string | null;
  customerId: number | null;
  namaPelanggan: string | null;
  total: number;
  isLunas: boolean;
  tglJatuhTempo: string | null;
}

function toIso(v: Date | string | null): string | null {
  if (!v) return null;
  if (v instanceof Date) return v.toISOString();
  return v;
}

export function normalizeFakturRow(row: RawFakturRow): FakturListItem {
  return {
    noFaktur: row.noFaktur,
    tanggal: toIso(row.tanggal),
    customerId: row.customerId != null ? Number(row.customerId) : null,
    namaPelanggan: row.namaPelanggan,
    total: Number(row.total ?? 0),
    isLunas: Number(row.isLunas) === 1,
    tglJatuhTempo: row.tglJatuhTempo,
  };
}
