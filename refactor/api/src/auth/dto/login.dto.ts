import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @IsString() @IsNotEmpty() @MaxLength(60)
  username: string;

  @IsString() @IsNotEmpty() @MaxLength(128)
  password: string;

  @IsString() @IsNotEmpty() @MaxLength(30)
  kode: string;
}
