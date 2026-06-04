import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'tenants' })
export class Tenant {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ length: 100 })
  nama: string;

  @Column({ length: 60, unique: true })
  slug: string;

  @Column({ length: 30, unique: true })
  kode: string;

  @Column({ length: 36, unique: true })
  token: string;

  @Column({ name: 'expired_at', type: 'timestamp', nullable: true })
  expiredAt: Date | null;

  @Column({ name: 'grace_period_days', type: 'tinyint', unsigned: true, default: 7 })
  gracePeriodDays: number;

  @Column({ type: 'enum', enum: ['aktif', 'nonaktif', 'kedaluwarsa'], default: 'aktif' })
  status: 'aktif' | 'nonaktif' | 'kedaluwarsa';

  @Column({ length: 20, default: 'basic' })
  paket: string;

  @Column({ name: 'last_activity_at', type: 'timestamp', nullable: true })
  lastActivityAt: Date | null;

  @Column({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt: Date | null;

  @Column({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;
}
