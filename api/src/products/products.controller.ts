import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Get()
  findAll(
    @Query('category') categorySlug?: string,
    @Query('priceFrom') priceFrom?: string,
    @Query('priceTo') priceTo?: string,
    @Query('categoryIds') categoryIds?: string,
    @Query('sort') sort?: string,
  ) {
    return this.productsService.findAll({
      categorySlug,
      priceFrom: priceFrom ? Number(priceFrom) : undefined,
      priceTo: priceTo ? Number(priceTo) : undefined,
      categoryIds: categoryIds?.split(',').filter(Boolean),
      sort,
    });
  }

  @Get(':productId')
  findById(@Param('productId') productId: string) {
    return this.productsService.findById(productId);
  }
}