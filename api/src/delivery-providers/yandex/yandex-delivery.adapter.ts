import { Injectable } from '@nestjs/common';

import type {
  DeliveryProviderAdapter,
  DeliveryQuoteOption,
  DeliveryQuoteRequest,
} from '../contracts/delivery-provider.types';
import { DeliveryProviderError } from '../delivery-provider.error';
import { YandexCargoClient } from './cargo/yandex-cargo.client';
import { YandexDeliveryConfig } from './yandex-delivery.config';
import { YandexMockClient } from './yandex-mock.client';
import { YandexRussiaClient } from './russia/yandex-russia.client';

@Injectable()
export class YandexDeliveryAdapter implements DeliveryProviderAdapter {
  readonly providerCode = 'YANDEX';
  constructor(
    private readonly config: YandexDeliveryConfig,
    private readonly mock: YandexMockClient,
    private readonly cargo: YandexCargoClient,
    private readonly russia: YandexRussiaClient,
  ) {}
  getCapabilities() {
    return {
      quoteCalculation: true,
      doorDelivery: true,
      pickupDelivery: true,
      scheduledIntervals: true,
      liveOrderCreation: false,
      cancellation: false,
      tracking: false,
      statusPolling: false,
      callbacks: false,
    };
  }

  async calculateQuotes(request: DeliveryQuoteRequest) {
    if (!this.config.enabled)
      throw new DeliveryProviderError(
        'PROVIDER_DISABLED',
        'Яндекс Доставка отключена.',
      );
    const cargoCodes = request.serviceCodes.filter((code) =>
      ['YANDEX_EXPRESS', 'YANDEX_CARGO'].includes(code),
    );
    const russiaCodes = request.serviceCodes.filter((code) =>
      ['YANDEX_RUSSIA_DOOR', 'YANDEX_RUSSIA_PICKUP'].includes(code),
    );
    const calculations: Array<Promise<DeliveryQuoteOption[]>> = [];
    if (cargoCodes.length && this.config.expressEnabled)
      calculations.push(
        Promise.resolve().then(() =>
          this.config.expressMode === 'mock'
            ? this.mock.calculate({ ...request, serviceCodes: cargoCodes })
            : this.cargo.calculate({ ...request, serviceCodes: cargoCodes }),
        ),
      );
    if (russiaCodes.length && this.config.russiaEnabled)
      calculations.push(
        Promise.resolve().then(() =>
          this.config.russiaMode === 'mock'
            ? this.mock.calculate({ ...request, serviceCodes: russiaCodes })
            : this.russia.calculate({ ...request, serviceCodes: russiaCodes }),
        ),
      );
    const settled = await Promise.allSettled(calculations);
    const results = settled.flatMap((result) =>
      result.status === 'fulfilled' ? result.value : [],
    );
    if (!results.length) {
      const failure = settled.find(
        (result): result is PromiseRejectedResult =>
          result.status === 'rejected',
      );
      if (failure) throw failure.reason;
    }
    return results;
  }
}
