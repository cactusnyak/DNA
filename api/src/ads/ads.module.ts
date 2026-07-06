import { Module } from '@nestjs/common';

import { AdCategoriesModule } from '../ad-categories/ad-categories.module';
import { AdminModule } from '../admin/admin.module';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';

import { AdsController } from './ads.controller';
import { AdsModerationService } from './ads-moderation.service';
import { AdsService } from './ads.service';

@Module({
  imports: [PrismaModule, AdCategoriesModule, AuthModule, AdminModule],
  controllers: [AdsController],
  providers: [AdsService, AdsModerationService],
  exports: [AdsService],
})
export class AdsModule {}
