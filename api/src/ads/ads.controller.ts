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
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AuthService } from '../auth/auth.service';
import {
  AdminUploadsService,
  type AdminUploadedImageFile,
} from '../admin/admin-uploads.service';

import { AdsService } from './ads.service';
import { AdQueryDto } from './dto/ad-query.dto';
import type { CreateAdDto } from './dto/create-ad.dto';
import type { UpdateAdDto } from './dto/update-ad.dto';

@ApiTags('Ads')
@Controller('ads')
export class AdsController {
  constructor(
    private readonly adsService: AdsService,
    private readonly authService: AuthService,
    private readonly adminUploadsService: AdminUploadsService,
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

    return this.adminUploadsService.uploadImage(file);
  }

  @Get('my')
  async findMyAds(@Headers('authorization') authorizationHeader?: string) {
    const user = await this.authService.getMeFromAuthorizationHeader(
      authorizationHeader,
    );

    return this.adsService.findMyAds(user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List public advertisements' })
  @ApiOkResponse({ description: 'Public advertisements' })
  findAll(@Query() query: AdQueryDto) {
    return this.adsService.findAll({
      categorySlug: query.category,
      priceFrom: query.priceFrom,
      priceTo: query.priceTo,
      categoryIds: query.categoryIds,
      sort: query.sort,
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
