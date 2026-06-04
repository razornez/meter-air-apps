import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'customer' })
export class Customer {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'tenant_id', type: 'int', unsigned: true, default: 1 })
  tenantId: number;

  @Column({ type: 'int', nullable: true })
  urut: number | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nama: string | null;

  @Column({ type: 'text', nullable: true })
  alamat: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  tipe: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  kota: string | null;

  @Column({ type: 'int', nullable: true })
  rt: number | null;

  @Column({ type: 'int', nullable: true })
  rw: number | null;

  @Column({ type: 'varchar', length: 25, nullable: true })
  telp: string | null;

  @Column({ name: 'no_kk', type: 'varchar', length: 25, nullable: true })
  noKk: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  foto: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  barcode: string | null;

  @Column({ name: 'tgl_daftar', type: 'datetime', nullable: true })
  tglDaftar: Date | null;

  @Column({ type: 'tinyint', width: 1, default: 1 })
  status: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
    transformer: { to: (v) => v, from: (v) => (v == null ? null : Number(v)) },
  })
  latitude: number | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
    transformer: { to: (v) => v, from: (v) => (v == null ? null : Number(v)) },
  })
  longitude: number | null;
}
