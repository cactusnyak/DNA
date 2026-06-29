import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';

import { CatalogCollectionsController } from './catalog-collections.controller';
import { CatalogCollectionsService } from './catalog-collections.service';

@Module({
  imports: [PrismaModule],
  controllers: [CatalogCollectionsController],
  providers: [CatalogCollectionsService],
})
export class CatalogCollectionsModule {}