import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { UsersModule } from '../users/users.module';

import { AdminAdCategoriesController } from './admin-ad-categories.controller';
import { AdminAdsController } from './admin-ads.controller';
import { AdminAdsService } from './admin-ads.service';
import { AdminCatalogCollectionsController } from './admin-catalog-collections.controller';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminInputService } from './admin-input.service';
import { AdminMarketCatalogService } from './admin-market-catalog.service';
import { AdminMarketCategoriesController } from './admin-market-categories.controller';
import { AdminOrdersController } from './admin-orders.controller';
import { AdminOrdersService } from './admin-orders.service';
import { AdminOverviewController } from './admin-overview.controller';
import { AdminProductsController } from './admin-products.controller';
import { AdminService } from './admin.service';
import { AdminUploadsController } from './admin-uploads.controller';
import { AdminUploadsService } from './admin-uploads.service';
import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from './admin-users.service';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, StorageModule],
  controllers: [
    AdminOverviewController,
    AdminUploadsController,
    AdminMarketCategoriesController,
    AdminProductsController,
    AdminCatalogCollectionsController,
    AdminOrdersController,
    AdminAdCategoriesController,
    AdminAdsController,
    AdminUsersController,
  ],
  providers: [
    AdminService,
    AdminAdsService,
    AdminMarketCatalogService,
    AdminDashboardService,
    AdminInputService,
    AdminOrdersService,
    AdminUploadsService,
    AdminUsersService,
  ],
  exports: [AdminService, AdminUploadsService],
})
export class AdminModule {}
