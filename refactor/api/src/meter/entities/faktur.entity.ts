import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'faktur' })
export class Faktur {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'tenant_id', type: 'int', unsigned: true, default: 1 })
  tenantId: number;

  @Column({ name: 'no_faktur', type: 'varchar', length: 25, nullable: true })
  noFaktur: string | null;

  @Column({ type: 'datetime', nullable: true })
  tanggal: Date | null;

  @Column({ type: 'varchar', length: 7, nullable: true })
  periode: string | null;

  @Column({ type: 'varchar', length: 10, default: 'pos' })
  jenis: string;

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

  @Column({ type: 'varchar', length: 50, nullable: true })
  customer: string | null;

  @Column({ name: 'tgl_jatuh_tempo', type: 'date', nullable: true })
  tglJatuhTempo: string | null;

  @Column({ name: 'foto_meter', type: 'varchar', length: 100, nullable: true })
  fotoMeter: string | null;

  @Column({ name: 'is_done', type: 'tinyint', nullable: true })
  isDone: number | null;

  @Column({ name: 'is_lunas', type: 'tinyint', width: 1, default: 0 })
  isLunas: number;

  @Column({ type: 'text', nullable: true })
  catatan: string | null;
}
