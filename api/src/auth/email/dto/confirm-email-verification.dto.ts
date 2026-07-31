import { IsString, MaxLength, MinLength } from 'class-validator';

export class ConfirmEmailVerificationDto {
  @IsString()
  @MinLength(16)
  @MaxLength(512)
  token!: string;
}
