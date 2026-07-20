import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';

import { CatalogCollectionsService } from './catalog-collections.service';

@Module({
  imports: [PrismaModule],
  providers: [CatalogCollectionsService],
  exports: [CatalogCollectionsService],
})
export class CatalogCollectionsModule {}