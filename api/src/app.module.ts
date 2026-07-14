import { Module } from '@nestjs/common';

import { AdminModule } from './admin/admin.module';
import { AdCategoriesModule } from './ad-categories/ad-categories.module';
import { AdsModule } from './ads/ads.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CatalogCollectionsModule } from './catalog-collections/catalog-collections.module';
import { FeedModule } from './feed/feed.module';
import { MarketCategoriesModule } from './market-categories/market-categories.module';
import { MarketModule } from './market/market.module';
import { FavouritesModule } from './favourites/favourites.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { ReferralsModule } from './referrals/referrals.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    PrismaModule,
    ProductsModule,
    MarketCategoriesModule,
    CatalogCollectionsModule,
    MarketModule,
    AdCategoriesModule,
    AdsModule,
    FeedModule,
    FavouritesModule,
    OrdersModule,
    PaymentsModule,
    UsersModule,
    AuthModule,
    ReferralsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
