import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'transaksi' })
export class Transaksi {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'tenant_id', type: 'int', unsigned: true, default: 1 })
  tenantId: number;

  @Column({ type: 'varchar', length: 25 })
  barcode: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  produk: string | null;

  @Column({ type: 'int', default: 0 })
  harga: number;

  @Column({ type: 'int', nullable: true })
  quantity: number | null;

  @Column({ type: 'int', nullable: true })
  diskon: number | null;

  @Column({ type: 'int', nullable: true })
  total: number | null;

  @Column({ type: 'int', default: 0 })
  dibayar: number;

  @Column({ type: 'varchar', length: 25, nullable: true })
  faktur: string | null;
}
