import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterEmailDto {
  @IsString()
  @MaxLength(254)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(64)
  nickname!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  inviterReferralCode?: string;
}
