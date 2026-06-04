import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'level_pemakaian' })
export class LevelPemakaian {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'tenant_id', type: 'int', unsigned: true, default: 1 })
  tenantId: number;

  @Column({ type: 'varchar', length: 55 })
  jenis: string;

  @Column({ type: 'int' })
  level: number;

  @Column({ type: 'int' })
  harga: number;

  @Column({ name: 'per_pemakaian', type: 'int' })
  perPemakaian: number;

  @Column({ name: 'per_pemakaian_max', type: 'int', nullable: true })
  perPemakaianMax: number | null;
}
