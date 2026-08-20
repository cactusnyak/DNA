import { Body, Controller, Headers, Param, Post, Put } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { AuthService } from '../auth/auth.service';
import {
  ResolveDeliveryLocationDto,
  UpdateOrderDeliveryPlanDto,
  UpdateOrderDestinationDto,
} from './dto/order-delivery.dto';
import { OrderDeliveryService } from './order-delivery.service';
import { DeliveryLocationResolver } from './delivery-location.resolver';

@Controller()
export class OrderDeliveryController {
  constructor(
    private readonly delivery: OrderDeliveryService,
    private readonly auth: AuthService,
    private readonly locations: DeliveryLocationResolver,
  ) {}

  @Put('orders/:orderId/delivery/destination')
  updateDestination(
    @Param('orderId') orderId: string,
    @Body() body: UpdateOrderDestinationDto,
    @Headers('authorization') authorization?: string,
    @Headers('x-guest-session-id') guestSessionId?: string,
  ) {
    return this.owner(authorization, guestSessionId).then((owner) =>
      this.delivery.confirmDestination(orderId, body, owner),
    );
  }

  @Put('orders/:orderId/delivery/plan')
  updatePlan(
    @Param('orderId') orderId: string,
    @Body() body: UpdateOrderDeliveryPlanDto,
    @Headers('authorization') authorization?: string,
    @Headers('x-guest-session-id') guestSessionId?: string,
  ) {
    return this.owner(authorization, guestSessionId).then((owner) =>
      this.delivery.selectPlan(orderId, body, owner),
    );
  }

  @Post('delivery/locations/resolve')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  resolveLocation(@Body() body: ResolveDeliveryLocationDto) {
    return this.locations.resolve(body.query);
  }

  private async owner(authorization?: string, guestSessionId?: string) {
    const user =
      await this.auth.getOptionalMeFromAuthorizationHeader(authorization);
    return {
      userId: user?.id,
      guestSessionId: user ? undefined : guestSessionId,
    };
  }
}
