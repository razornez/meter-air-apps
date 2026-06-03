import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Map ke tabel `history_meter` (riwayat angka meter per pelanggan).
@Entity({ name: 'history_meter' })
export class HistoryMeter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'id_pelanggan', type: 'int' })
  idPelanggan: number;

  @Column({ name: 'no_faktur', length: 50 })
  noFaktur: string;

  @Column({ type: 'int' })
  meter: number;

  @Column({ name: 'tanggal_catat', type: 'date' })
  tanggalCatat: string;

  @Column({ name: 'jam_catat', type: 'time' })
  jamCatat: string;
}
