import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { Roles } from '../auth/decorators/roles.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import { AdminService } from './admin.service';
import { AdminDashboardService } from './admin-dashboard.service';

@ApiTags('Admin / Overview')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminOverviewController {
  constructor(
    private readonly adminService: AdminService,
    private readonly adminDashboardService: AdminDashboardService,
  ) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get admin dashboard overview counters' })
  getOverview() {
    return this.adminDashboardService.getOverview();
  }

  @Get('catalog')
  @ApiOperation({ summary: 'Get full admin catalog snapshot' })
  getCatalog() {
    return this.adminService.getCatalog();
  }

  @Get('referrals')
  @ApiOperation({ summary: 'Get referral tree' })
  getReferrals() {
    return this.adminDashboardService.getReferrals();
  }
}
