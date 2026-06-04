import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'config' })
export class AppConfig {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'tenant_id', type: 'int', unsigned: true, default: 1 })
  tenantId: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  perusahaan: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  logo: string | null;

  @Column({ type: 'varchar', length: 25, nullable: true })
  telp: string | null;

  @Column({ type: 'text', nullable: true })
  alamat: string | null;
}
