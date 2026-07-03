import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserRole } from '@prisma/client';

import { Roles } from '../auth/decorators/roles.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import {
  AdminService,
  type AdminUploadedImageFile,
} from './admin.service';

@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  @Get('overview')
  getOverview() {
    return this.adminService.getOverview();
  }

  @Get('catalog')
  getCatalog() {
    return this.adminService.getCatalog();
  }

  @Post('uploads/images')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  uploadImage(@UploadedFile() file?: AdminUploadedImageFile) {
    return this.adminService.uploadImage(file);
  }

  @Post('categories')
  createCategory(@Body() body: unknown) {
    return this.adminService.createCategory(body);
  }

  @Patch('categories/:id')
  updateCategory(@Param('id') id: string, @Body() body: unknown) {
    return this.adminService.updateCategory(id, body);
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string) {
    return this.adminService.deleteCategory(id);
  }

  @Delete('categories/:id/permanent')
  hardDeleteCategory(@Param('id') id: string) {
    return this.adminService.hardDeleteCategory(id);
  }

  @Patch('categories/:id/restore')
  restoreCategory(@Param('id') id: string) {
    return this.adminService.restoreCategory(id);
  }

  @Post('products')
  createProduct(@Body() body: unknown) {
    return this.adminService.createProduct(body);
  }

  @Patch('products/:id')
  updateProduct(@Param('id') id: string, @Body() body: unknown) {
    return this.adminService.updateProduct(id, body);
  }

  @Delete('products/:id')
  deleteProduct(@Param('id') id: string) {
    return this.adminService.deleteProduct(id);
  }

  @Delete('products/:id/permanent')
  hardDeleteProduct(@Param('id') id: string) {
    return this.adminService.hardDeleteProduct(id);
  }

  @Patch('products/:id/restore')
  restoreProduct(@Param('id') id: string) {
    return this.adminService.restoreProduct(id);
  }

  @Post('catalog-collections')
  createCatalogCollection(@Body() body: unknown) {
    return this.adminService.createCatalogCollection(body);
  }

  @Patch('catalog-collections/:id')
  updateCatalogCollection(@Param('id') id: string, @Body() body: unknown) {
    return this.adminService.updateCatalogCollection(id, body);
  }

  @Delete('catalog-collections/:id')
  deleteCatalogCollection(@Param('id') id: string) {
    return this.adminService.deleteCatalogCollection(id);
  }

  @Delete('catalog-collections/:id/permanent')
  hardDeleteCatalogCollection(@Param('id') id: string) {
    return this.adminService.hardDeleteCatalogCollection(id);
  }

  @Patch('catalog-collections/:id/restore')
  restoreCatalogCollection(@Param('id') id: string) {
    return this.adminService.restoreCatalogCollection(id);
  }

  @Put('catalog-collections/:id/categories')
  updateCatalogCollectionCategories(
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    return this.adminService.updateCatalogCollectionCategories(id, body);
  }

  @Put('catalog-collections/:id/products')
  updateCatalogCollectionProducts(
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    return this.adminService.updateCatalogCollectionProducts(id, body);
  }

  @Patch('orders/:id/status')
  updateOrderStatus(@Param('id') id: string, @Body() body: unknown) {
    return this.adminService.updateOrderStatus(id, body);
  }

  @Delete('orders/:id')
  hardDeleteOrder(@Param('id') id: string) {
    return this.adminService.hardDeleteOrder(id);
  }
}

