import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Foto bukti meteran disimpan langsung di database (LONGBLOB) agar
// persisten — tidak hilang saat container API redeploy (Railway ephemeral FS).
@Entity({ name: 'meter_photo' })
export class MeterPhoto {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'tenant_id', type: 'int', unsigned: true, default: 1 })
  tenantId: number;

  // Satu foto per faktur (unique) — dipakai sebagai key saat upload & serve.
  @Column({ name: 'no_faktur', type: 'varchar', length: 50 })
  noFaktur: string;

  @Column({ type: 'varchar', length: 40, default: 'image/jpeg' })
  mime: string;

  @Column({ type: 'longblob' })
  data: Buffer;

  @Column({ name: 'created_at', type: 'datetime', nullable: true })
  createdAt: Date | null;
}
