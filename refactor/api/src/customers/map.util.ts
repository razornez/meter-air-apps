// Util murni: derive penanda peta dari baris query. Mudah diuji.

export type MarkerStatus = 'lunas' | 'belum' | 'none';

export interface RawMarkerRow {
  id: number | string;
  nama: string | null;
  alamat: string | null;
  lat: number | string | null;
  lng: number | string | null;
  isLunas: number | string | null;
  noFaktur: string | null;
}

export interface CustomerMarker {
  id: number;
  nama: string | null;
  alamat: string | null;
  lat: number;
  lng: number;
  status: MarkerStatus;
}

// none = belum ada tagihan; lunas = faktur terakhir lunas; belum = ada tapi belum lunas.
export function markerStatus(
  noFaktur: string | null,
  isLunas: number | string | null,
): MarkerStatus {
  if (!noFaktur) return 'none';
  return Number(isLunas) === 1 ? 'lunas' : 'belum';
}

export function mapCustomerMarkerRow(r: RawMarkerRow): CustomerMarker {
  return {
    id: Number(r.id),
    nama: r.nama,
    alamat: r.alamat,
    lat: Number(r.lat),
    lng: Number(r.lng),
    status: markerStatus(r.noFaktur, r.isLunas),
  };
}
