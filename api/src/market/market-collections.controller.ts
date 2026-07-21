import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CatalogCollectionsService } from '../catalog-collections/catalog-collections.service';

@ApiTags('Market / Collections')
@Controller('market/collections')
export class MarketCollectionsController {
  constructor(
    private readonly catalogCollectionsService: CatalogCollectionsService,
  ) {}

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.catalogCollectionsService.findBySlug(slug);
  }
}
