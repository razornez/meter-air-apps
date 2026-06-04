import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Map ke tabel `payment_method` (master data metode pembayaran).
@Entity({ name: 'payment_method' })
export class PaymentMethod {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 30, unique: true })
  code: string;

  @Column({ length: 100 })
  name: string;

  // cash = tunai manual; midtrans = via Snap API; transfer = info rekening manual
  @Column({ type: 'enum', enum: ['cash', 'midtrans', 'transfer'] })
  type: 'cash' | 'midtrans' | 'transfer';

  @Column({ name: 'is_active', type: 'tinyint', width: 1, default: 1 })
  isActive: number;

  @Column({ length: 10, default: '💳' })
  icon: string;

  @Column({ type: 'text', nullable: true })
  instructions: string | null;

  @Column({ name: 'account_number', type: 'varchar', length: 50, nullable: true })
  accountNumber: string | null;

  @Column({ name: 'account_name', type: 'varchar', length: 100, nullable: true })
  accountName: string | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;
}
