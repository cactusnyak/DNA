import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';

import { AdCategoriesService } from './ad-categories.service';

@Module({
  imports: [PrismaModule],
  providers: [AdCategoriesService],
  exports: [AdCategoriesService],
})
export class AdCategoriesModule {}
