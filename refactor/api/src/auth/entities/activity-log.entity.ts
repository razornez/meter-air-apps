import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Map ke tabel `log_aktivitas` (PARTITIONED BY RANGE per kuartal).
// PK komposit (id, waktu) karena partisi. Untuk INSERT cukup set waktu,
// TypeORM akan return lastInsertRowid tanpa SELECT-back yang butuh full PK.
@Entity({ name: 'log_aktivitas' })
export class ActivityLog {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'tenant_id', type: 'int', unsigned: true, default: 1 })
  tenantId: number;

  @Column({ name: 'id_user', type: 'int', unsigned: true })
  idUser: number;

  @Column({ type: 'text' })
  aktivitas: string;

  @Column({ type: 'datetime' })
  waktu: Date;

  @Column({ type: 'varchar', length: 250, nullable: true })
  jenis: string | null;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip: string | null;
}
