import { Controller, Get, Param } from '@nestjs/common';

import { CatalogCollectionsService } from '../catalog-collections/catalog-collections.service';

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
