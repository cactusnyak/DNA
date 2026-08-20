/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller, Headers, Param, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { AuthService } from '../auth/auth.service';
import { DeliveryQuoteOrchestrator } from './delivery-quote.orchestrator';

@Controller('orders')
export class OrderDeliveryQuotesController {
  constructor(
    private readonly orchestrator: DeliveryQuoteOrchestrator,
    private readonly auth: AuthService,
  ) {}

  @Post(':orderId/delivery/quotes')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async calculate(
    @Param('orderId') orderId: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-guest-session-id') guestSessionId?: string,
  ) {
    const user =
      await this.auth.getOptionalMeFromAuthorizationHeader(authorization);
    return this.orchestrator.calculate(
      orderId,
      {},
      {
        userId: user?.id,
        guestSessionId,
      },
    );
  }
}
