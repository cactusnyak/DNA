import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { AuthService } from '../auth/auth.service';
import type { AdminUploadedImageFile } from '../admin/admin.service';
import { AdminService } from '../admin/admin.service';

import { AdCategoriesService } from '../ad-categories/ad-categories.service';
import { AdsService } from './ads.service';
import type { CreateAdDto } from './dto/create-ad.dto';
import type { UpdateAdDto } from './dto/update-ad.dto';

@Controller('ads')
export class AdsController {
  constructor(
    private readonly adsService: AdsService,
    private readonly adCategoriesService: AdCategoriesService,
    private readonly authService: AuthService,
    private readonly adminService: AdminService,
  ) {}

  @Post('uploads/images')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async uploadImage(
    @UploadedFile() file: AdminUploadedImageFile | undefined,
    @Headers('authorization') authorizationHeader?: string,
  ) {
    await this.authService.getMeFromAuthorizationHeader(authorizationHeader);

    return this.adminService.uploadImage(file);
  }

  @Get('categories')
  findCategories() {
    return this.adCategoriesService.findAll();
  }

  @Get('my')
  async findMyAds(@Headers('authorization') authorizationHeader?: string) {
    const user = await this.authService.getMeFromAuthorizationHeader(
      authorizationHeader,
    );

    return this.adsService.findMyAds(user.id);
  }

  @Get()
  findAll(
    @Query('category') categorySlug?: string,
    @Query('priceFrom') priceFrom?: string,
    @Query('priceTo') priceTo?: string,
    @Query('categoryIds') categoryIds?: string,
    @Query('sort') sort?: string,
  ) {
    return this.adsService.findAll({
      categorySlug,
      priceFrom: priceFrom ? Number(priceFrom) : undefined,
      priceTo: priceTo ? Number(priceTo) : undefined,
      categoryIds: categoryIds?.split(',').filter(Boolean),
      sort,
    });
  }

  @Get(':adId')
  findById(@Param('adId') adId: string) {
    return this.adsService.findById(adId);
  }

  @Post()
  async create(
    @Body() body: CreateAdDto,
    @Headers('authorization') authorizationHeader?: string,
  ) {
    const user = await this.authService.getMeFromAuthorizationHeader(
      authorizationHeader,
    );

    return this.adsService.create(user.id, body);
  }

  @Patch(':adId')
  async update(
    @Param('adId') adId: string,
    @Body() body: UpdateAdDto,
    @Headers('authorization') authorizationHeader?: string,
  ) {
    const user = await this.authService.getMeFromAuthorizationHeader(
      authorizationHeader,
    );

    return this.adsService.update(adId, user.id, body);
  }

  @Delete(':adId')
  @HttpCode(204)
  async remove(
    @Param('adId') adId: string,
    @Headers('authorization') authorizationHeader?: string,
  ) {
    const user = await this.authService.getMeFromAuthorizationHeader(
      authorizationHeader,
    );

    await this.adsService.softDelete(adId, user.id);
  }
}
