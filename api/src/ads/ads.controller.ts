import { Controller, Get } from '@nestjs/common';

@Controller('ads')
export class AdsController {
  @Get('categories')
  findCategories() {
    return [];
  }
}
