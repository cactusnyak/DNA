import { Module } from '@nestjs/common';

import { AdCategoriesModule } from '../ad-categories/ad-categories.module';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';

import { AdsController } from './ads.controller';
import { AdsModerationService } from './ads-moderation.service';
import { AdsService } from './ads.service';

@Module({
  imports: [PrismaModule, AdCategoriesModule, AuthModule],
  controllers: [AdsController],
  providers: [AdsService, AdsModerationService],
  exports: [AdsService],
})
export class AdsModule {}
