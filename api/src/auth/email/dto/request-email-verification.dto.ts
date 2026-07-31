import { IsString, MaxLength } from 'class-validator';

export class RequestEmailVerificationDto {
  @IsString()
  @MaxLength(254)
  email!: string;
}
