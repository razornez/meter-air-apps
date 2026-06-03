import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Map ke tabel `pembayaran` (riwayat pelunasan/pembatalan). Lihat migrasi
// refactor/api/migrations/001_create_pembayaran.sql.
@Entity({ name: 'pembayaran' })
export class Pembayaran {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'no_faktur', type: 'varchar', length: 25 })
  noFaktur: string;

  @Column({ type: 'int', default: 0 })
  jumlah: number;

  // 'lunas' | 'batal'
  @Column({ type: 'varchar', length: 10, default: 'lunas' })
  tipe: string;

  @Column({ name: 'id_user', type: 'int', nullable: true })
  idUser: number | null;

  @Column({ type: 'datetime' })
  waktu: Date;
}
