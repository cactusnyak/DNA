import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ProductsService } from '../products/products.service';

import { MarketProductQueryDto } from './dto/market-product-query.dto';

@ApiTags('Market / Products')
@Controller('market/products')
export class MarketProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List public market products' })
  @ApiOkResponse({ description: 'Public market products' })
  findAll(@Query() query: MarketProductQueryDto) {
    return this.productsService.findAll({
      categorySlug: query.category,
      priceFrom: query.priceFrom,
      priceTo: query.priceTo,
      categoryIds: query.categoryIds,
      sort: query.sort,
    });
  }

  @Get(':productId')
  findById(@Param('productId') productId: string) {
    return this.productsService.findById(productId);
  }
}
