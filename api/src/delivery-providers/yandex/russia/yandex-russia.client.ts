import { Injectable } from '@nestjs/common';

import type {
  DeliveryQuoteOption,
  DeliveryQuoteRequest,
} from '../../contracts/delivery-provider.types';
import { DeliveryProviderError } from '../../delivery-provider.error';
import {
  millimetersToCentimeters,
  normalizeKopecks,
  normalizeRussianPhone,
} from '../../utils/logistics-units';
import { YandexDeliveryConfig } from '../yandex-delivery.config';
import { YandexHttpClient } from '../yandex-http.client';

type RussiaOffer = {
  id?: string;
  offer_id?: string;
  price?: number;
  cost?: number;
  delivery_interval?: { from?: string; to?: string };
  title?: string;
  description?: string;
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
        platform_station_id: stationId,
        recipient: {
          name: request.destination.recipientName,
          phone: normalizeRussianPhone(request.destination.recipientPhone),
          email: request.destination.recipientEmail,
        },
        destination: {
          address: request.destination.fullAddress,
          postal_code: request.destination.postalCode,
        },
        pickup_point_id: request.externalPickupPointId,
        places: request.packages.map((item) => ({
          external_id: `${item.orderItemId}:${item.packageSequence}`,
          weight: item.weightGrams * item.quantity,
          dimensions: {
            length: millimetersToCentimeters(item.lengthMillimeters),
            width: millimetersToCentimeters(item.widthMillimeters),
            height: millimetersToCentimeters(item.heightMillimeters),
          },
        })),
      },
    });
    const offers = this.parseOffers(response);
    const pickup = Boolean(request.externalPickupPointId);
    return offers.map((offer, index) => ({
      serviceCode: pickup ? 'YANDEX_RUSSIA_PICKUP' : 'YANDEX_RUSSIA_DOOR',
      title: offer.title || (pickup ? 'Доставка до ПВЗ' : 'Доставка до двери'),
      description: offer.description,
      fulfillmentType: pickup ? 'PICKUP' : 'DOOR',
      providerCost: normalizeKopecks(offer.price ?? offer.cost),
      currency: 'RUB',
      deliveryInterval:
        offer.delivery_interval?.from && offer.delivery_interval.to
          ? {
              from: offer.delivery_interval.from,
              to: offer.delivery_interval.to,
            }
          : undefined,
      expiresAt: new Date(Date.now() + this.config.quoteTtlSeconds * 1000),
      providerOfferRef: offer.offer_id ?? offer.id ?? `russia:${index}`,
      privateProviderPayload: offer,
      rawProviderPrice: { kopecks: offer.price ?? offer.cost, currency: 'RUB' },
      contour: 'russia',
      mode: this.config.russiaMode,
    }));
  }

  async detectLocation(address: string, correlationId: string) {
    return this.http.request<unknown>({
      contour: 'russia',
      baseUrl: this.config.russiaBaseUrl,
      token: this.config.russiaToken,
      path: '/api/b2b/platform/location/detect',
      correlationId,
      body: { address },
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

  private parseOffers(value: unknown): RussiaOffer[] {
    const record =
      value && typeof value === 'object'
        ? (value as Record<string, unknown>)
        : {};
    const raw = Array.isArray(record.offers)
      ? record.offers
      : Array.isArray(record.pricing_options)
        ? record.pricing_options
        : [];
    const offers = raw.filter((item): item is RussiaOffer =>
      Boolean(
        item && typeof item === 'object' && ('price' in item || 'cost' in item),
      ),
    );
    if (!offers.length)
      throw new DeliveryProviderError(
        'NO_AVAILABLE_OFFERS',
        'Яндекс не вернул доступных вариантов доставки.',
      );
    return offers;
  }
}
