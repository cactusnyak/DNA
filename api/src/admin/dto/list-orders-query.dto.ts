import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export enum OrdersArchivedFilter {
  TRUE = 'true',
  FALSE = 'false',
  ALL = 'all',
}

export class ListOrdersQueryDto {
  @ApiPropertyOptional({
    enum: OrdersArchivedFilter,
    default: OrdersArchivedFilter.FALSE,
    description:
      'Filter by archived state. false = active only, true = archived only, all = both.',
  })
  @IsOptional()
  @IsEnum(OrdersArchivedFilter)
  archived: OrdersArchivedFilter = OrdersArchivedFilter.FALSE;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = 20;
}
