import { Controller, Get } from '@nestjs/common';

import { AdCategoriesService } from '../ad-categories/ad-categories.service';

@Controller('ads/categories')
export class AdCategoriesController {
  constructor(private readonly adCategoriesService: AdCategoriesService) {}

  @Get()
  findAll() {
    return this.adCategoriesService.findAll();
  }
}
