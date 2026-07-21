import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { Roles } from '../auth/decorators/roles.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import { AdminMarketCatalogService } from './admin-market-catalog.service';

@ApiTags('Admin / Catalog collections')
@ApiBearerAuth()
@Controller('admin/catalog-collections')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminCatalogCollectionsController {
  constructor(
    private readonly adminMarketCatalogService: AdminMarketCatalogService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a catalog collection' })
  createCatalogCollection(@Body() body: unknown) {
    return this.adminMarketCatalogService.createCatalogCollection(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a catalog collection' })
  updateCatalogCollection(@Param('id') id: string, @Body() body: unknown) {
    return this.adminMarketCatalogService.updateCatalogCollection(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a catalog collection' })
  deleteCatalogCollection(@Param('id') id: string) {
    return this.adminMarketCatalogService.deleteCatalogCollection(id);
  }

  @Delete(':id/permanent')
  @ApiOperation({ summary: 'Hard-delete a catalog collection' })
  hardDeleteCatalogCollection(@Param('id') id: string) {
    return this.adminMarketCatalogService.hardDeleteCatalogCollection(id);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore a catalog collection' })
  restoreCatalogCollection(@Param('id') id: string) {
    return this.adminMarketCatalogService.restoreCatalogCollection(id);
  }

  @Put(':id/categories')
  @ApiOperation({ summary: 'Replace a collection categories' })
  updateCatalogCollectionCategories(
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    return this.adminMarketCatalogService.updateCatalogCollectionCategories(
      id,
      body,
    );
  }

  @Put(':id/products')
  @ApiOperation({ summary: 'Replace a collection products' })
  updateCatalogCollectionProducts(
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    return this.adminMarketCatalogService.updateCatalogCollectionProducts(
      id,
      body,
    );
  }
}
