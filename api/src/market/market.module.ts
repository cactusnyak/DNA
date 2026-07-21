import { Module } from '@nestjs/common';

import { CatalogCollectionsModule } from '../catalog-collections/catalog-collections.module';
import { MarketCategoriesModule } from '../market-categories/market-categories.module';
import { ProductsModule } from '../products/products.module';

import { MarketCategoriesController } from './market-categories.controller';
import { MarketCollectionsController } from './market-collections.controller';
import { MarketProductsController } from './market-products.controller';

@Module({
  imports: [
    CatalogCollectionsModule,
    MarketCategoriesModule,
    ProductsModule,
  ],
  controllers: [
    MarketCategoriesController,
    MarketCollectionsController,
    MarketProductsController,
  ],
  exports: [
    CatalogCollectionsModule,
    MarketCategoriesModule,
    ProductsModule,
  ],
})
export class MarketModule {}

