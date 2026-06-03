import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Map ke tabel `supplier`.
@Entity({ name: 'supplier' })
export class Supplier {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 35, nullable: true })
  nama: string | null;

  @Column({ type: 'text', nullable: true })
  alamat: string | null;

  @Column({ type: 'varchar', length: 15, nullable: true })
  telepon: string | null;
}
