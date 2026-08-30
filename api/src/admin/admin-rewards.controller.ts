import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import type { Request } from 'express';

import { Roles } from '../auth/decorators/roles.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RewardsService } from '../rewards/rewards.service';
import { calculateReward } from '../rewards/reward-calculation';

type AdminRequest = Request & { user?: { id: string } };

@ApiTags('Admin / Rewards')
@ApiBearerAuth()
@Controller('admin/rewards')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminRewardsController {
  constructor(private readonly rewards: RewardsService) {}

  @Get('configuration')
  configuration() {
    return this.rewards.getConfiguration();
  }

  @Post('preview')
  preview(
    @Body()
    body: {
      price?: number;
      costBasis?: number | null;
      rewardEnabled?: boolean;
      shares?: Array<{ depth: number; shareBasisPoints: number }>;
    },
  ) {
    return calculateReward({
      eligibleRevenue: Math.trunc(body.price ?? 0),
      costBasis: body.costBasis == null ? null : Math.trunc(body.costBasis),
      rewardEnabled: body.rewardEnabled === true,
      shares: body.shares ?? [],
    });
  }

  @Get()
  search(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize = 25,
  ) {
    return this.rewards.adminSearch(page, pageSize);
  }

  @Post('orders/:orderId/release')
  release(@Param('orderId') orderId: string) {
    return this.rewards.releaseOrderRewards(orderId);
  }

  @Post('orders/:orderId/cancel')
  cancel(
    @Param('orderId') orderId: string,
    @Body() body: { reason?: string },
    @Req() request: AdminRequest,
  ) {
    return this.rewards.cancelPendingRewards(
      orderId,
      body.reason ?? '',
      request.user?.id,
    );
  }

  @Post('orders/:orderId/reverse')
  reverse(
    @Param('orderId') orderId: string,
    @Body()
    body: {
      reason?: string;
      returnedItems?: Array<{ orderItemId: string; quantity: number }>;
    },
    @Req() request: AdminRequest,
  ) {
    return this.rewards.reverseOrderRewards(
      orderId,
      body.reason ?? '',
      request.user?.id,
      body.returnedItems,
    );
  }
}
