// Normalisasi baris snapshot pelanggan (hasil query raw) → tipe rapi. Murni.

export interface RawSnapshotRow {
  id: number | string;
  nama: string | null;
  alamat: string | null;
  tipe: string | null;
  barcode: string | null;
  lastMeter: number | string | null;
}

export interface CustomerSnapshot {
  id: number;
  nama: string | null;
  alamat: string | null;
  tipe: string | null;
  barcode: string | null;
  lastMeter: number;
}

export function normalizeSnapshotRow(r: RawSnapshotRow): CustomerSnapshot {
  return {
    id: Number(r.id),
    nama: r.nama,
    alamat: r.alamat,
    tipe: r.tipe,
    barcode: r.barcode,
    lastMeter: Number(r.lastMeter ?? 0),
  };
}
