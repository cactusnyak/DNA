import { Injectable } from '@nestjs/common';

import type {
  DeliveryQuoteOption,
  DeliveryQuoteRequest,
} from '../../contracts/delivery-provider.types';
import { DeliveryProviderError } from '../../delivery-provider.error';
import {
  millimetersToCentimeters,
  normalizeDecimalRubles,
} from '../../utils/logistics-units';
import { YandexDeliveryConfig } from '../yandex-delivery.config';
import { YandexHttpClient } from '../yandex-http.client';

type RussiaPricingResponse = {
  pricing_total?: string;
  delivery_days?: number;
};

@Injectable()
export class YandexRussiaClient {
  constructor(
    private readonly config: YandexDeliveryConfig,
    private readonly http: YandexHttpClient,
  ) {}

  async calculate(
    request: DeliveryQuoteRequest,
  ): Promise<DeliveryQuoteOption[]> {
    const stationId =
      request.warehouseExternalLocationId ||
      (this.config.russiaMode !== 'production'
        ? this.config.russiaStationId
        : '');
    if (!stationId)
      throw new DeliveryProviderError(
        'PLATFORM_STATION_REQUIRED',
        'Для склада не настроен platform_station_id.',
      );
    const response = await this.http.request<unknown>({
      contour: 'russia',
      baseUrl: this.config.russiaBaseUrl,
      token: this.config.russiaToken,
      path: '/api/b2b/platform/pricing-calculator',
      correlationId: request.correlationId,
      body: {
        source: { platform_station_id: stationId },
        destination: request.externalPickupPointId
          ? { platform_station_id: request.externalPickupPointId }
          : { address: request.destination.fullAddress },
        tariff: request.externalPickupPointId ? 'self_pickup' : 'time_interval',
        total_weight: request.packages.reduce(
          (sum, item) => sum + item.weightGrams * item.quantity,
          0,
        ),
        total_assessed_price: 0,
        client_price: 0,
        payment_method: 'already_paid',
        places: request.packages.map((item) => ({
          physical_dims: {
            weight_gross: item.weightGrams * item.quantity,
            dx: millimetersToCentimeters(item.lengthMillimeters),
            dy: millimetersToCentimeters(item.widthMillimeters),
            dz: millimetersToCentimeters(item.heightMillimeters),
          },
        })),
      },
    });
    const pricing = this.parsePricing(response);
    const pickup = Boolean(request.externalPickupPointId);
    return [
      {
        serviceCode: pickup ? 'YANDEX_RUSSIA_PICKUP' : 'YANDEX_RUSSIA_DOOR',
        title: pickup ? 'Доставка до ПВЗ' : 'Доставка до двери',
        description: pricing.delivery_days
          ? `Ориентировочно ${pricing.delivery_days} дн.`
          : undefined,
        fulfillmentType: pickup ? 'PICKUP' : 'DOOR',
        providerCost: normalizeDecimalRubles(
          pricing.pricing_total?.replace(/\s*RUB\s*$/i, ''),
        ),
        currency: 'RUB',
        expiresAt: new Date(Date.now() + this.config.quoteTtlSeconds * 1000),
        providerOfferRef: `russia:${pricing.delivery_days ?? 'unknown'}:${pricing.pricing_total}`,
        privateProviderPayload: pricing,
        rawProviderPrice: { value: pricing.pricing_total, currency: 'RUB' },
        contour: 'russia',
        mode: this.config.russiaMode,
      },
    ];
  }

  async detectLocation(address: string, correlationId: string) {
    return this.http.request<unknown>({
      contour: 'russia',
      baseUrl: this.config.russiaBaseUrl,
      token: this.config.russiaToken,
      path: '/api/b2b/platform/location/detect',
      correlationId,
      body: { location: address },
    });
  }

  async listPickupPoints(params: {
    geoId: string;
    limit: number;
    correlationId: string;
  }) {
    return this.http.request<unknown>({
      contour: 'russia',
      baseUrl: this.config.russiaBaseUrl,
      token: this.config.russiaToken,
      path: '/api/b2b/platform/pickup-points/list',
      correlationId: params.correlationId,
      body: { geo_id: params.geoId, limit: Math.min(params.limit, 100) },
    });
  }

  private parsePricing(value: unknown): RussiaPricingResponse {
    const record =
      value && typeof value === 'object'
        ? (value as RussiaPricingResponse)
        : {};
    if (typeof record.pricing_total !== 'string')
      throw new DeliveryProviderError(
        'MALFORMED_PROVIDER_RESPONSE',
        'Яндекс вернул расчёт доставки в неизвестном формате.',
      );
    return record;
  }
}
