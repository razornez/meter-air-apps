import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/**
 * Jejak order pembayaran kasugai yang diinisiasi → dipakai job rekonsiliasi untuk
 * menanyakan status ke kasugai & menandai faktur lunas bila webhook terlewat.
 */
@Entity({ name: 'payment_intent' })
export class PaymentIntent {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'tenant_id', type: 'int', unsigned: true, default: 1 })
  tenantId: number;

  @Column({ name: 'order_id', type: 'varchar', length: 120 })
  orderId: string;

  @Column({ name: 'no_faktur', type: 'varchar', length: 25, nullable: true })
  noFaktur: string | null;

  @Column({ type: 'int', unsigned: true, default: 0 })
  amount: number;

  @Column({ type: 'varchar', length: 20, default: 'pending' }) // pending|paid|expired|failed
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
