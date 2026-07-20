import {
  IsIn,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @MinLength(3)
  @MaxLength(254)
  login!: string;

  @IsIn(['login', 'register'])
  mode!: 'login' | 'register';

  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/)
  code!: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(64)
  nickname?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  inviterReferralCode?: string;
}
