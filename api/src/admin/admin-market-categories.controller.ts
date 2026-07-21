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

import { AdminMarketCatalogService } from './admin-market-catalog.service';

@ApiTags('Admin / Market / Categories')
@ApiBearerAuth()
@Controller('admin/categories')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminMarketCategoriesController {
  constructor(
    private readonly adminMarketCatalogService: AdminMarketCatalogService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a market category' })
  createCategory(@Body() body: unknown) {
    return this.adminMarketCatalogService.createCategory(body);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Bulk soft-delete market categories' })
  bulkDeleteMarketCategories(@Body() body: unknown) {
    return this.adminMarketCatalogService.bulkDeleteMarketCategories(body);
  }

  @Delete('bulk/permanent')
  @ApiOperation({ summary: 'Bulk hard-delete market categories' })
  bulkHardDeleteMarketCategories(@Body() body: unknown) {
    return this.adminMarketCatalogService.bulkHardDeleteMarketCategories(body);
  }

  @Patch('bulk/restore')
  @ApiOperation({ summary: 'Bulk restore market categories' })
  bulkRestoreMarketCategories(@Body() body: unknown) {
    return this.adminMarketCatalogService.bulkRestoreMarketCategories(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a market category' })
  updateCategory(@Param('id') id: string, @Body() body: unknown) {
    return this.adminMarketCatalogService.updateCategory(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a market category' })
  deleteCategory(@Param('id') id: string) {
    return this.adminMarketCatalogService.deleteCategory(id);
  }

  @Delete(':id/permanent')
  @ApiOperation({ summary: 'Hard-delete a market category' })
  hardDeleteCategory(@Param('id') id: string) {
    return this.adminMarketCatalogService.hardDeleteCategory(id);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore a market category' })
  restoreCategory(@Param('id') id: string) {
    return this.adminMarketCatalogService.restoreCategory(id);
  }
}
