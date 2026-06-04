import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'history_meter' })
export class HistoryMeter {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'tenant_id', type: 'int', unsigned: true, default: 1 })
  tenantId: number;

  @Column({ name: 'id_pelanggan', type: 'int', unsigned: true })
  idPelanggan: number;

  @Column({ name: 'no_faktur', type: 'varchar', length: 50 })
  noFaktur: string;

  @Column({ type: 'int' })
  meter: number;

  @Column({ name: 'tanggal_catat', type: 'date', nullable: true })
  tanggalCatat: string | null;

  @Column({ name: 'jam_catat', type: 'time', nullable: true })
  jamCatat: string | null;
}
