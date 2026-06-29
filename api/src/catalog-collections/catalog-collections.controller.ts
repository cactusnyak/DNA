import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';

import { CatalogCollectionsService } from './catalog-collections.service';

@Controller('catalog-collections')
export class CatalogCollectionsController {
  constructor(
    private readonly catalogCollectionsService: CatalogCollectionsService,
  ) {}

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.catalogCollectionsService.findBySlug(slug);
  }
}