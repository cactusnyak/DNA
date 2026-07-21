import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { MarketCategoriesService } from '../market-categories/market-categories.service';

@ApiTags('Market / Categories')
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
