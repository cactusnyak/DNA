import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query('categoryId') categoryId?: string) {
    return this.productsService.findAll({
      categoryId,
    });
  }

  @Get(':productId')
  findById(@Param('productId') productId: string) {
    return this.productsService.findById(productId);
  }
}