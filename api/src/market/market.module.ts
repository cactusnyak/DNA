import { Module } from '@nestjs/common';

import { CategoriesModule } from '../categories/categories.module';
import { ProductsModule } from '../products/products.module';

import { MarketController } from './market.controller';

@Module({
  imports: [
    CategoriesModule,
    ProductsModule,
  ],
  controllers: [MarketController],
})
export class MarketModule {}
