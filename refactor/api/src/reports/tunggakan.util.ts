// Kelompokkan baris faktur tunggakan per pelanggan. Murni → mudah diuji.

export interface RawTunggakanRow {
  customerId: number | string;
  nama: string | null;
  alamat: string | null;
  total: number | string | null;
  denda: number | string | null;
  hariTelat: number | string | null;
}

export interface TunggakanItem {
  customerId: number;
  nama: string | null;
  alamat: string | null;
  jumlahFaktur: number;
  totalTagihan: number;
  totalDenda: number;
  grandTotal: number;
  hariTelatMax: number;
}

export function groupTunggakan(rows: RawTunggakanRow[]): TunggakanItem[] {
  const map = new Map<number, TunggakanItem>();

  for (const r of rows) {
    const id = Number(r.customerId);
    const tagihan = Number(r.total ?? 0);
    const denda = Number(r.denda ?? 0);
    const hari = Number(r.hariTelat ?? 0);

    const existing = map.get(id);
    if (existing) {
      existing.jumlahFaktur++;
      existing.totalTagihan += tagihan;
      existing.totalDenda += denda;
      existing.grandTotal += tagihan + denda;
      existing.hariTelatMax = Math.max(existing.hariTelatMax, hari);
    } else {
      map.set(id, {
        customerId: id,
        nama: r.nama,
        alamat: r.alamat,
        jumlahFaktur: 1,
        totalTagihan: tagihan,
        totalDenda: denda,
        grandTotal: tagihan + denda,
        hariTelatMax: hari,
      });
    }
  }

  return [...map.values()].sort((a, b) => b.grandTotal - a.grandTotal);
}
