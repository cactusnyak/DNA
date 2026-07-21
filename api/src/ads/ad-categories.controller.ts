import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AdCategoriesService } from '../ad-categories/ad-categories.service';

@ApiTags('Ads / Categories')
@Controller('ads/categories')
export class AdCategoriesController {
  constructor(private readonly adCategoriesService: AdCategoriesService) {}

  @Get()
  findAll() {
    return this.adCategoriesService.findAll();
  }
}
