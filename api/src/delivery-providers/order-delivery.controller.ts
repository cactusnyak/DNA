import { Body, Controller, Headers, Param, Post, Put } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { AuthService } from '../auth/auth.service';
import {
  ResolveDeliveryLocationDto,
  UpdateOrderDeliverySelectionsDto,
  UpdateOrderDestinationDto,
} from './dto/order-delivery.dto';
import { DeliveryProviderError } from './delivery-provider.error';
import { OrderDeliveryService } from './order-delivery.service';
import { YandexDeliveryConfig } from './yandex/yandex-delivery.config';

@Controller()
export class OrderDeliveryController {
  constructor(
    private readonly delivery: OrderDeliveryService,
    private readonly auth: AuthService,
    private readonly yandexConfig: YandexDeliveryConfig,
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

  @Put('orders/:orderId/delivery/selections')
  updateSelections(
    @Param('orderId') orderId: string,
    @Body() body: UpdateOrderDeliverySelectionsDto,
    @Headers('authorization') authorization?: string,
    @Headers('x-guest-session-id') guestSessionId?: string,
  ) {
    return this.owner(authorization, guestSessionId).then((owner) =>
      this.delivery.replaceSelections(orderId, body, owner),
    );
  }

  @Post('delivery/locations/resolve')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  resolveLocation(@Body() body: ResolveDeliveryLocationDto) {
    const query = body.query.trim();
    if (!query)
      throw new DeliveryProviderError(
        'ADDRESS_REQUIRED',
        'Введите адрес доставки.',
      );
    if (
      this.yandexConfig.expressMode !== 'mock' ||
      this.yandexConfig.russiaMode !== 'mock'
    )
      throw new DeliveryProviderError(
        'LOCATION_RESOLVER_NOT_CONFIGURED',
        'Автоматическое определение координат пока недоступно. Выберите доставку по России.',
        false,
        503,
      );
    return {
      country: 'Россия',
      city: query.split(',')[0]?.trim() || 'Москва',
      fullAddress: query,
      latitude: 55.75393,
      longitude: 37.620795,
      externalLocationId: `mock:${Buffer.from(query).toString('base64url').slice(0, 16)}`,
    };
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
