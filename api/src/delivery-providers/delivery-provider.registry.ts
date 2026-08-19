import { Injectable } from '@nestjs/common';

import type { DeliveryProviderAdapter } from './contracts/delivery-provider.types';
import { DeliveryProviderError } from './delivery-provider.error';
import { YandexDeliveryAdapter } from './yandex/yandex-delivery.adapter';

@Injectable()
export class DeliveryProviderRegistry {
  private readonly adapters: Map<string, DeliveryProviderAdapter>;

  constructor(yandex: YandexDeliveryAdapter) {
    this.adapters = new Map([[yandex.providerCode, yandex]]);
  }

  get(providerCode: string) {
    const adapter = this.adapters.get(providerCode);
    if (!adapter) {
      throw new DeliveryProviderError(
        'PROVIDER_NOT_SUPPORTED',
        `Провайдер ${providerCode} не поддерживается.`,
      );
    }
    return adapter;
  }
}
