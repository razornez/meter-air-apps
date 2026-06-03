import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Map ke tabel `customer` (pelanggan air).
@Entity({ name: 'customer' })
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  urut: number | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  nama: string | null;

  @Column({ type: 'text', nullable: true })
  alamat: string | null;

  // B / N / S — menentukan jenis tarif (level_pemakaian.jenis).
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

  @Column({ type: 'int', width: 1, default: 1 })
  status: number;
}
