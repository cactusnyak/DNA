import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class SendOtpDto {
  @IsString()
  @MinLength(3)
  @MaxLength(254)
  login!: string;

  @IsIn(['login', 'register'])
  mode!: 'login' | 'register';

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
