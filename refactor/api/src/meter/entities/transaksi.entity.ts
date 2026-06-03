import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Map ke tabel `transaksi` (baris item dari sebuah faktur).
@Entity({ name: 'transaksi' })
export class Transaksi {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 25 })
  barcode: string;

  @Column({ type: 'varchar', length: 25, nullable: true })
  produk: string | null;

  @Column({ type: 'int' })
  harga: number;

  // Di skema lama bertipe varchar(5).
  @Column({ type: 'varchar', length: 5, nullable: true })
  quantity: string | null;

  @Column({ length: 25, default: '0' })
  diskon: string;

  @Column({ type: 'int', nullable: true })
  total: number | null;

  @Column({ type: 'int', default: 0 })
  dibayar: number;

  @Column({ type: 'varchar', length: 25, nullable: true })
  faktur: string | null;
}
