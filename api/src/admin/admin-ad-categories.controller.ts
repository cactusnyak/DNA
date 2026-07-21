import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { Roles } from '../auth/decorators/roles.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import { AdminAdsService } from './admin-ads.service';

@ApiTags('Admin / Ad categories')
@ApiBearerAuth()
@Controller('admin/ad-categories')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminAdCategoriesController {
  constructor(private readonly adminAdsService: AdminAdsService) {}

  @Post()
  @ApiOperation({ summary: 'Create an ad category' })
  createAdCategory(@Body() body: unknown) {
    return this.adminAdsService.createAdCategory(body);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Bulk soft-delete ad categories' })
  bulkDeleteAdCategories(@Body() body: unknown) {
    return this.adminAdsService.bulkDeleteAdCategories(body);
  }

  @Delete('bulk/permanent')
  @ApiOperation({ summary: 'Bulk hard-delete ad categories' })
  bulkHardDeleteAdCategories(@Body() body: unknown) {
    return this.adminAdsService.bulkHardDeleteAdCategories(body);
  }

  @Patch('bulk/restore')
  @ApiOperation({ summary: 'Bulk restore ad categories' })
  bulkRestoreAdCategories(@Body() body: unknown) {
    return this.adminAdsService.bulkRestoreAdCategories(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an ad category' })
  updateAdCategory(@Param('id') id: string, @Body() body: unknown) {
    return this.adminAdsService.updateAdCategory(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete an ad category' })
  deleteAdCategory(@Param('id') id: string) {
    return this.adminAdsService.deleteAdCategory(id);
  }

  @Delete(':id/permanent')
  @ApiOperation({ summary: 'Hard-delete an ad category' })
  hardDeleteAdCategory(@Param('id') id: string) {
    return this.adminAdsService.hardDeleteAdCategory(id);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore an ad category' })
  restoreAdCategory(@Param('id') id: string) {
    return this.adminAdsService.restoreAdCategory(id);
  }
}
