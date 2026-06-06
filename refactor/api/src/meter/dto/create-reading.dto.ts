import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

// Simpan catatan meter baru untuk seorang pelanggan.
export class CreateReadingDto {
  @IsInt()
  @IsNotEmpty()
  customerId: number;

  // Angka meter yang dibaca petugas di lapangan.
  @IsInt()
  @Min(0)
  meterBaru: number;

  @IsString() @IsOptional() @MaxLength(500)
  catatan?: string;
}
