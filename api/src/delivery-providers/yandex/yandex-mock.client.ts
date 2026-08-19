import { Injectable } from '@nestjs/common';

import type {
  DeliveryQuoteOption,
  DeliveryQuoteRequest,
} from '../contracts/delivery-provider.types';
import { DeliveryProviderError } from '../delivery-provider.error';
import { YandexDeliveryConfig } from './yandex-delivery.config';

@Injectable()
export class YandexMockClient {
  constructor(private readonly config: YandexDeliveryConfig) {}

  calculate(request: DeliveryQuoteRequest): DeliveryQuoteOption[] {
    if (request.destination.city === '__timeout__')
      throw new DeliveryProviderError(
        'PROVIDER_TIMEOUT',
        'Провайдер доставки не ответил вовремя.',
        true,
        503,
      );
    if (request.destination.city === '__unavailable__')
      throw new DeliveryProviderError(
        'PROVIDER_UNAVAILABLE',
        'Провайдер доставки временно недоступен.',
        true,
        503,
      );
    const totalWeight = request.packages.reduce(
      (sum, item) => sum + item.weightGrams * item.quantity,
      0,
    );
    const base = 350 + Math.ceil(totalWeight / 1000) * 25;
    const expiresAt = new Date(Date.now() + this.config.quoteTtlSeconds * 1000);
    return request.serviceCodes.flatMap((serviceCode, index) => {
      const pickup = serviceCode === 'YANDEX_RUSSIA_PICKUP';
      const serviceTitles: Record<string, string> = {
        YANDEX_EXPRESS: 'Экспресс',
        YANDEX_CARGO: 'Грузовой',
        YANDEX_RUSSIA_DOOR: 'Доставка по России — до двери',
        YANDEX_RUSSIA_PICKUP: 'Доставка по России — ПВЗ',
      };
      return [
        {
          serviceCode,
          title: serviceTitles[serviceCode] ?? serviceCode,
          description: 'Детерминированный mock-расчёт',
          fulfillmentType: pickup ? ('PICKUP' as const) : ('DOOR' as const),
          providerCost: base + index * 120,
          currency: 'RUB' as const,
          deliveryInterval: {
            from: new Date(Date.now() + 3600_000).toISOString(),
            to: new Date(Date.now() + 7200_000).toISOString(),
          },
          expiresAt,
          pickupPoint: pickup
            ? {
                externalId: request.externalPickupPointId ?? 'mock-pvz-1',
                name: 'Тестовый ПВЗ',
                address: request.destination.fullAddress,
              }
            : undefined,
          providerOfferRef: `mock-${serviceCode.toLowerCase()}`,
          privateProviderPayload: { mock: true, serviceCode },
          rawProviderPrice: { rubles: base + index * 120 },
          contour: serviceCode.startsWith('YANDEX_RUSSIA') ? 'russia' : 'cargo',
          mode: 'mock',
        },
      ];
    });
  }
}
