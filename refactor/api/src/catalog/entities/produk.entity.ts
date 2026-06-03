import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Map ke tabel `produk` (master barang/unit). Hanya kolom yang dipakai.
@Entity({ name: 'produk' })
export class Produk {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 11, nullable: true })
  barcode: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nama: string | null;

  @Column({ type: 'varchar', length: 15, nullable: true })
  satuan: string | null;

  @Column({ name: 'harga_jual', type: 'int', nullable: true })
  hargaJual: number | null;

  // Di skema lama bertipe varchar(11).
  @Column({ type: 'varchar', length: 11, nullable: true })
  stok: string | null;
}
