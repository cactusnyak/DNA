import { Controller, Get } from '@nestjs/common';

import { MarketCategoriesService } from '../market-categories/market-categories.service';

@Controller('market/categories')
export class MarketCategoriesController {
  constructor(
    private readonly marketCategoriesService: MarketCategoriesService,
  ) {}

  @Get()
  findAll() {
    return this.marketCategoriesService.findAll();
  }
}
