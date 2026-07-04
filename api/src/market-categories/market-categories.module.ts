import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';

import { MarketCategoriesService } from './market-categories.service';

@Module({
  imports: [PrismaModule],
  providers: [MarketCategoriesService],
  exports: [MarketCategoriesService],
})
export class MarketCategoriesModule {}
