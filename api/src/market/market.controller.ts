import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';

import { CategoriesService } from '../categories/categories.service';
import { ProductsService } from '../products/products.service';

@Controller('market')
export class MarketController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly productsService: ProductsService,
  ) {}

  @Get('categories')
  findCategories() {
    return this.categoriesService.findAll();
  }

  @Get('products')
  findProducts(
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

  @Get('products/:productId')
  findProductById(@Param('productId') productId: string) {
    return this.productsService.findById(productId);
  }
}
