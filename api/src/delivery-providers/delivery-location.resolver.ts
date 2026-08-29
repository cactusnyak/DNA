import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import { DeliveryProviderError } from './delivery-provider.error';
import { YandexDeliveryConfig } from './yandex/yandex-delivery.config';
import { YandexRussiaClient } from './yandex/russia/yandex-russia.client';

type DetectedLocation = { geo_id?: string | number; address?: string };

@Injectable()
export class DeliveryLocationResolver {
  constructor(
    private readonly config: YandexDeliveryConfig,
    private readonly russia: YandexRussiaClient,
  ) {}

  async resolve(rawQuery: string) {
    const query = rawQuery.trim();
    if (!query)
      throw new DeliveryProviderError(
        'ADDRESS_REQUIRED',
        'Введите адрес доставки.',
      );
    if (this.config.expressMode === 'mock' && this.config.russiaMode === 'mock')
      return {
        country: 'Россия',
        city: query.split(',')[0]?.trim() || 'Москва',
        fullAddress: query,
        latitude: 55.75393,
        longitude: 37.620795,
        externalLocationId: `mock:${Buffer.from(query).toString('base64url').slice(0, 16)}`,
        capabilities: { cargo: true, russiaDoor: true },
      };
    if (this.config.russiaMode === 'mock')
      throw new DeliveryProviderError(
        'LOCATION_RESOLVER_NOT_CONFIGURED',
        'Для экспресс-доставки требуется отдельный серверный геокодер. Доставка по России доступна после переключения её контура из mock.',
        false,
        503,
      );

    const response = await this.russia.detectLocation(query, randomUUID());
    const variants = this.variants(response);
    if (variants.length !== 1)
      throw new DeliveryProviderError(
        variants.length ? 'ADDRESS_AMBIGUOUS' : 'ADDRESS_NOT_FOUND',
        variants.length
          ? 'Уточните адрес: найдено несколько населённых пунктов.'
          : 'Не удалось определить населённый пункт по адресу.',
      );
    const variant = variants[0];
    return {
      country: 'Россия',
      city: variant.address!,
      fullAddress: query,
      externalLocationId: `yandex-russia-geo:${variant.geo_id}`,
      capabilities: { cargo: false, russiaDoor: true },
    };
  }

  private variants(value: unknown): DetectedLocation[] {
    if (!value || typeof value !== 'object') return [];
    const variants = (value as { variants?: unknown }).variants;
    if (!Array.isArray(variants)) return [];
    return variants.filter((item): item is DetectedLocation =>
      Boolean(
        item &&
        typeof item === 'object' &&
        'geo_id' in item &&
        typeof (item as DetectedLocation).address === 'string',
      ),
    );
  }
}
