import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Map ke tabel `faktur` (tagihan).
@Entity({ name: 'faktur' })
export class Faktur {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'no_faktur', type: 'varchar', length: 25, nullable: true })
  noFaktur: string | null;

  @Column({ type: 'datetime', nullable: true })
  tanggal: Date | null;

  @Column({ type: 'int', nullable: true })
  kasir: number | null;

  @Column({ type: 'int', nullable: true })
  subtotal: number | null;

  @Column({ type: 'int', nullable: true })
  beban: number | null;

  @Column({ type: 'int', nullable: true })
  denda: number | null;

  @Column({ type: 'int', nullable: true })
  diskon: number | null;

  @Column({ type: 'int', nullable: true })
  ppn: number | null;

  @Column({ name: 'biaya_kirim', type: 'int', nullable: true })
  biayaKirim: number | null;

  @Column({ type: 'int', nullable: true })
  total: number | null;

  @Column({ name: 'diskon_tipe', type: 'varchar', length: 5, nullable: true })
  diskonTipe: string | null;

  // Di skema lama bertipe varchar; berisi customer.id.
  @Column({ type: 'varchar', length: 50, nullable: true })
  customer: string | null;

  @Column({ name: 'tgl_jatuh_tempo', type: 'date', nullable: true })
  tglJatuhTempo: string | null;

  @Column({ name: 'foto_meter', type: 'varchar', length: 100, nullable: true })
  fotoMeter: string | null;

  @Column({ name: 'is_done', type: 'int', nullable: true })
  isDone: number | null;

  @Column({ name: 'is_lunas', type: 'int', width: 1, default: 0 })
  isLunas: number;

  @Column({ type: 'text', nullable: true })
  catatan: string | null;
}
