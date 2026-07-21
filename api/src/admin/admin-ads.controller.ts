import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { Roles } from '../auth/decorators/roles.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import { AdminAdsService } from './admin-ads.service';

@ApiTags('Admin / Ads')
@ApiBearerAuth()
@Controller('admin/ads')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminAdsController {
  constructor(private readonly adminAdsService: AdminAdsService) {}

  @Delete('bulk')
  @ApiOperation({ summary: 'Bulk soft-delete ads' })
  bulkDeleteAds(@Body() body: unknown) {
    return this.adminAdsService.bulkDeleteAds(body);
  }

  @Delete('bulk/permanent')
  @ApiOperation({ summary: 'Bulk hard-delete ads' })
  bulkHardDeleteAds(@Body() body: unknown) {
    return this.adminAdsService.bulkHardDeleteAds(body);
  }

  @Patch('bulk/restore')
  @ApiOperation({ summary: 'Bulk restore ads' })
  bulkRestoreAds(@Body() body: unknown) {
    return this.adminAdsService.bulkRestoreAds(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an ad' })
  updateAd(@Param('id') id: string, @Body() body: unknown) {
    return this.adminAdsService.updateAd(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete an ad' })
  deleteAd(@Param('id') id: string) {
    return this.adminAdsService.deleteAd(id);
  }

  @Delete(':id/permanent')
  @ApiOperation({ summary: 'Hard-delete an ad' })
  hardDeleteAd(@Param('id') id: string) {
    return this.adminAdsService.hardDeleteAd(id);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore an ad' })
  restoreAd(@Param('id') id: string) {
    return this.adminAdsService.restoreAd(id);
  }
}
