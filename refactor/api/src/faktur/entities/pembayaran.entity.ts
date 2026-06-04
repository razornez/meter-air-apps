import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Map ke tabel `pembayaran` (meterair — skema Laravel baru).
@Entity({ name: 'pembayaran' })
export class Pembayaran {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'tenant_id', type: 'int', unsigned: true, default: 1 })
  tenantId: number;

  @Column({ name: 'no_faktur', type: 'varchar', length: 25 })
  noFaktur: string;

  // 'cash' | 'gopay' | 'ovo' | 'dana' | 'bank_bca' | 'midtrans' | dll
  @Column({ type: 'varchar', length: 30, default: 'cash' })
  metode: string;

  @Column({ type: 'int', default: 0 })
  jumlah: number;

  // 'lunas' | 'pending' | 'batal'
  @Column({ type: 'varchar', length: 12, default: 'lunas' })
  status: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  ref: string | null;

  @Column({ name: 'paid_at', type: 'datetime', nullable: true })
  paidAt: Date | null;

  // FK ke users.id (kasir yang mencatat pembayaran)
  @Column({ type: 'int', unsigned: true, nullable: true })
  petugas: number | null;
}
