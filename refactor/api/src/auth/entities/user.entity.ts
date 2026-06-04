import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Map ke tabel `users` (meterair — skema baru Laravel multi-tenant).
@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'tenant_id', type: 'int', unsigned: true, default: 1 })
  tenantId: number;

  @Column({ length: 150, unique: true })
  username: string;

  // Kolom DB: `name` (bukan `fullname` — renamed di skema Laravel baru)
  @Column({ name: 'name', length: 100 })
  fullname: string;

  @Column({ length: 255 })
  password: string;

  // Kolom DB: tinyint(1), 1 = aktif (bukan varchar '1' seperti skema lama)
  @Column({ name: 'is_active', type: 'tinyint', width: 1, default: 1 })
  isActive: number;

  // Kolom DB: `photo` (bukan `foto`)
  @Column({ name: 'photo', type: 'varchar', length: 255, nullable: true })
  foto: string | null;

  // Kolom DB: `last_login_at` (bukan `last_login`)
  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLogin: Date | null;

  @Column({ name: 'is_admin', type: 'tinyint', width: 1, default: 0 })
  isAdmin: number;
}
