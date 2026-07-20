import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { UsersModule } from '../users/users.module';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminAdsService } from './admin-ads.service';
import { AdminMarketCatalogService } from './admin-market-catalog.service';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminInputService } from './admin-input.service';
import { AdminOrdersService } from './admin-orders.service';
import { AdminUploadsService } from './admin-uploads.service';
import { AdminUsersService } from './admin-users.service';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    StorageModule,
  ],
  controllers: [AdminController],
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
