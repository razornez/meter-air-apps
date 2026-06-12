import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PaymentDto {
  @IsString()
  @IsNotEmpty()
  noFaktur: string;

  // true = tandai lunas, false = batal lunas. Default true.
  @IsOptional()
  @IsBoolean()
  lunas?: boolean = true;

  // Alasan (opsional) — terutama saat batal lunas. Dicatat di log aktivitas.
  @IsOptional()
  @IsString()
  reason?: string;
}
