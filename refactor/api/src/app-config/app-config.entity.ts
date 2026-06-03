import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Map ke tabel `config` (identitas perusahaan). Hanya kolom yang dipakai.
@Entity({ name: 'config' })
export class AppConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, default: '' })
  perusahaan: string;

  @Column({ length: 100, default: '' })
  logo: string;

  @Column({ length: 15, default: '' })
  telp: string;

  @Column({ type: 'text' })
  alamat: string;
}
