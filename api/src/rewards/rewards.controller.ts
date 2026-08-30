import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthService } from '../auth/auth.service';
import { RewardsService } from './rewards.service';

@ApiTags('Rewards')
@Controller('rewards')
export class RewardsController {
  constructor(
    private readonly rewards: RewardsService,
    private readonly auth: AuthService,
  ) {}

  @Get('balance')
  async balance(@Headers('authorization') authorization?: string) {
    const user = await this.auth.getMeFromAuthorizationHeader(authorization);
    return this.rewards.getBalance(user.id);
  }

  @Get('history')
  async history(
    @Headers('authorization') authorization?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize = 25,
  ) {
    const user = await this.auth.getMeFromAuthorizationHeader(authorization);
    return this.rewards.getHistory(user.id, page, pageSize);
  }

  @Get('orders/:orderId')
  async order(
    @Param('orderId') orderId: string,
    @Headers('authorization') authorization?: string,
  ) {
    const user = await this.auth.getMeFromAuthorizationHeader(authorization);
    return this.rewards.getOrderRewards(orderId, user.id);
  }

  @Put('orders/:orderId/bonus')
  async applyBonus(
    @Param('orderId') orderId: string,
    @Body() body: { requestedAmount?: number },
    @Headers('authorization') authorization?: string,
  ) {
    const user = await this.auth.getMeFromAuthorizationHeader(authorization);
    return this.rewards.applyBonus(orderId, user.id, body.requestedAmount ?? 0);
  }

  @Delete('orders/:orderId/bonus')
  async removeBonus(
    @Param('orderId') orderId: string,
    @Headers('authorization') authorization?: string,
  ) {
    const user = await this.auth.getMeFromAuthorizationHeader(authorization);
    return this.rewards.removeBonus(orderId, user.id);
  }
}
