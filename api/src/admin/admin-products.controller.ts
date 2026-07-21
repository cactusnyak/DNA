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

@ApiTags('Admin / Market / Products')
@ApiBearerAuth()
@Controller('admin/products')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminProductsController {
  constructor(
    private readonly adminMarketCatalogService: AdminMarketCatalogService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a product' })
  createProduct(@Body() body: unknown) {
    return this.adminMarketCatalogService.createProduct(body);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Bulk soft-delete products' })
  bulkDeleteProducts(@Body() body: unknown) {
    return this.adminMarketCatalogService.bulkDeleteProducts(body);
  }

  @Delete('bulk/permanent')
  @ApiOperation({ summary: 'Bulk hard-delete products' })
  bulkHardDeleteProducts(@Body() body: unknown) {
    return this.adminMarketCatalogService.bulkHardDeleteProducts(body);
  }

  @Patch('bulk/restore')
  @ApiOperation({ summary: 'Bulk restore products' })
  bulkRestoreProducts(@Body() body: unknown) {
    return this.adminMarketCatalogService.bulkRestoreProducts(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  updateProduct(@Param('id') id: string, @Body() body: unknown) {
    return this.adminMarketCatalogService.updateProduct(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a product' })
  deleteProduct(@Param('id') id: string) {
    return this.adminMarketCatalogService.deleteProduct(id);
  }

  @Delete(':id/permanent')
  @ApiOperation({ summary: 'Hard-delete a product' })
  hardDeleteProduct(@Param('id') id: string) {
    return this.adminMarketCatalogService.hardDeleteProduct(id);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore a product' })
  restoreProduct(@Param('id') id: string) {
    return this.adminMarketCatalogService.restoreProduct(id);
  }
}
