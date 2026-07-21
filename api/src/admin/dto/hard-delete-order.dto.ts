import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class HardDeleteOrderDto {
  @ApiProperty({
    description: 'Human-readable reason for the permanent deletion',
    example: 'Test order created by mistake, confirmed with owner',
  })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  reason!: string;

  @ApiProperty({
    description:
      'Confirmation phrase. Must be exactly "DELETE ORDER <orderId>".',
    example: 'DELETE ORDER 8f2c6c2e-1a4b-4c7e-9c11-9f0d5e2b1a34',
  })
  @IsString()
  confirmation!: string;
}
