import { Module } from '@nestjs/common';

import { AdsModule } from '../ads/ads.module';
import { MarketModule } from '../market/market.module';

import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';

@Module({
  imports: [AdsModule, MarketModule],
  controllers: [FeedController],
  providers: [FeedService],
})
export class FeedModule {}
