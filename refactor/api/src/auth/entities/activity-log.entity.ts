import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Map ke tabel `log_aktivitas`.
@Entity({ name: 'log_aktivitas' })
export class ActivityLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'id_user', type: 'int' })
  idUser: number;

  @Column({ type: 'text' })
  aktivitas: string;

  @Column({ type: 'datetime' })
  waktu: Date;

  @Column({ length: 250 })
  jenis: string;
}
