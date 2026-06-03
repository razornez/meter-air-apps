import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

// Hitung rincian tarif tanpa menyimpan (preview di mobile).
export class CalculateDto {
  // customer.tipe / level_pemakaian.jenis (B/N/S)
  @IsString()
  @IsNotEmpty()
  tipe: string;

  @IsInt()
  @Min(0)
  pemakaian: number;
}
