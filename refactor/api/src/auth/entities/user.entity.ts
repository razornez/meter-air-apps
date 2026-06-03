import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Map ke tabel `users` yang sudah ada di DB pdam.
@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn({ name: 'id_user' })
  id: number;

  @Column({ length: 150 })
  username: string;

  @Column({ length: 256 })
  password: string;

  @Column({ length: 30 })
  fullname: string;

  // Di skema lama bertipe varchar(5); '1' = aktif.
  @Column({ name: 'is_active', length: 5, default: '1' })
  isActive: string;

  @Column({ length: 100, default: '' })
  foto: string;

  @Column({ name: 'last_login', type: 'datetime', nullable: true })
  lastLogin: Date | null;

  @Column({ name: 'is_admin', type: 'int', width: 1, default: 0 })
  isAdmin: number;
}
