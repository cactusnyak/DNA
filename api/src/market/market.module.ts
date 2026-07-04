import { Module } from '@nestjs/common';

import { MarketCategoriesModule } from '../market-categories/market-categories.module';
import { ProductsModule } from '../products/products.module';

import { MarketController } from './market.controller';

@Module({
  imports: [
    MarketCategoriesModule,
    ProductsModule,
  ],
  controllers: [MarketController],
})
export class MarketModule {}

