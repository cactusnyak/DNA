import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AdminModule } from './admin/admin.module';
import { AdsModule } from './ads/ads.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';
import { DeliveryQuotesModule } from './delivery-quotes/delivery-quotes.module';
import { DeliveryProvidersModule } from './delivery-providers/delivery-providers.module';
import { FeedModule } from './feed/feed.module';
import { HealthModule } from './health/health.module';
import { MarketModule } from './market/market.module';
import { FavouritesModule } from './favourites/favourites.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReferralsModule } from './referrals/referrals.module';
import { RewardsModule } from './rewards/rewards.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule,
    DeliveryQuotesModule,
    DeliveryProvidersModule,
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 100 }],
    }),
    PrismaModule,
    HealthModule,
    MarketModule,
    AdsModule,
    FeedModule,
    FavouritesModule,
    OrdersModule,
    PaymentsModule,
    UsersModule,
    AuthModule,
    ReferralsModule,
    RewardsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
