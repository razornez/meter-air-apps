import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Map ke tabel `level_pemakaian` (tarif berjenjang/blok per jenis pelanggan).
@Entity({ name: 'level_pemakaian' })
export class LevelPemakaian {
  @PrimaryGeneratedColumn()
  id: number;

  // Cocok dengan customer.tipe (B/N/S).
  @Column({ length: 55 })
  jenis: string;

  @Column({ type: 'int' })
  level: number;

  // Harga per m3 pada blok ini.
  @Column({ type: 'int' })
  harga: number;

  // Kapasitas blok (m3) yang ditampung pada level ini.
  @Column({ name: 'per_pemakaian', type: 'int' })
  perPemakaian: number;

  @Column({ name: 'per_pemakaian_max', type: 'int', nullable: true })
  perPemakaianMax: number | null;
}
