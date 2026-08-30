import { Injectable } from '@nestjs/common';

import { DeliveryProviderError } from '../delivery-provider.error';
import type { CdekTariff, CdekTariffListRequest } from './cdek-http.client';

@Injectable()
export class CdekMockClient {
  calculateTariffList(request: CdekTariffListRequest): CdekTariff[] {
    const destination = request.to_location as Record<string, unknown>;
    if (destination.city === '__cdek_timeout__')
      throw new DeliveryProviderError(
        'PROVIDER_TIMEOUT',
        'CDEK did not respond in time.',
        true,
        503,
      );
    if (destination.city === '__cdek_unavailable__')
      throw new DeliveryProviderError(
        'PROVIDER_UNAVAILABLE',
        'CDEK is temporarily unavailable.',
        true,
        503,
      );
    if (destination.city === '__cdek_validation__')
      throw new DeliveryProviderError(
        'PROVIDER_VALIDATION_ERROR',
        'CDEK rejected the delivery parameters.',
      );
    if (destination.city === '__cdek_no_tariff__') return [];

    const packages = request.packages as Array<Record<string, number>>;
    const weight = packages.reduce((sum, value) => sum + value.weight, 0);
    const base = 390 + Math.ceil(weight / 1000) * 35;
    const originMode = request.shipment_point ? 3 : 1;
    return [
      {
        tariff_code: originMode === 1 ? 137 : 136,
        tariff_name: 'СДЭК курьер стандарт',
        tariff_description: 'Детерминированный mock-расчёт',
        delivery_mode: originMode,
        delivery_sum: base,
        currency: 'RUB',
        period_min: 2,
        period_max: 4,
      },
      {
        tariff_code: originMode === 1 ? 233 : 234,
        tariff_name: 'СДЭК курьер экспресс',
        tariff_description: 'Детерминированный быстрый mock-тариф',
        delivery_mode: originMode,
        delivery_sum: base + 240,
        currency: 'RUB',
        period_min: 1,
        period_max: 2,
      },
      {
        tariff_code: 999_999,
        tariff_name: 'Некорректная тестовая запись',
        delivery_mode: originMode,
        delivery_sum: -1,
        currency: 'RUB',
        period_min: 0,
        period_max: -1,
      },
    ];
  }
}
