import { Module } from '@nestjs/common';

import { AdminModule } from './admin/admin.module';
import { AdsModule } from './ads/ads.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CatalogCollectionsModule } from './catalog-collections/catalog-collections.module';
import { CategoriesModule } from './categories/categories.module';
import { MarketModule } from './market/market.module';
import { OrdersModule } from './orders/orders.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { ReferralsModule } from './referrals/referrals.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    PrismaModule,
    ProductsModule,
    CategoriesModule,
    CatalogCollectionsModule,
    MarketModule,
    AdsModule,
    OrdersModule,
    UsersModule,
    AuthModule,
    ReferralsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}