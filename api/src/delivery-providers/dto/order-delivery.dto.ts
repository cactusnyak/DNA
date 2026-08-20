import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class UpdateOrderDestinationDto {
  @IsString() country!: string;
  @IsOptional() @IsString() region?: string;
  @IsString() city!: string;
  @IsOptional() @IsString() street?: string;
  @IsOptional() @IsString() building?: string;
  @IsOptional() @IsString() apartment?: string;
  @IsOptional() @IsString() postalCode?: string;
  @IsString() fullAddress!: string;
  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(-90)
  @Max(90)
  latitude?: number;
  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(-180)
  @Max(180)
  longitude?: number;
  @IsOptional() @IsString() externalLocationId?: string;
  @IsString() recipientName!: string;
  @IsString() recipientPhone!: string;
  @IsOptional() @IsEmail() recipientEmail?: string;
}

export class OrderDeliverySelectionDto {
  @IsString() groupKey!: string;
  @IsString() quoteId!: string;
}

export class UpdateOrderDeliverySelectionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderDeliverySelectionDto)
  selections!: OrderDeliverySelectionDto[];

  @IsOptional() @IsInt() @Min(1) pricingVersion?: number;
}

export class UpdateOrderDeliveryPlanDto {
  @IsString() planId!: string;
  @IsOptional() @IsInt() @Min(1) pricingVersion?: number;
}

export class ResolveDeliveryLocationDto {
  @IsString() query!: string;
}

export class SuggestDeliveryAddressDto {
  @IsString() query!: string;
}
