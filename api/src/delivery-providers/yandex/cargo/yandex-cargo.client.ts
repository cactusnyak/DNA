import { Injectable } from '@nestjs/common';

import type {
  DeliveryQuoteOption,
  DeliveryQuoteRequest,
} from '../../contracts/delivery-provider.types';
import { DeliveryProviderError } from '../../delivery-provider.error';
import {
  gramsToKilograms,
  millimetersToMeters,
  normalizeDecimalRubles,
} from '../../utils/logistics-units';
import { YandexDeliveryConfig } from '../yandex-delivery.config';
import { YandexHttpClient } from '../yandex-http.client';
import { getYandexOfferTitle } from '../yandex-offer-name';

type CargoOffer = {
  taxi_class?: string;
  description?: string;
  price?: {
    base_price?: unknown;
    total_price?: unknown;
    total_price_with_vat?: unknown;
    surge_ratio?: unknown;
    currency?: unknown;
  };
  pickup_interval?: { from?: string; to?: string };
  delivery_interval?: { from?: string; to?: string };
  payload?: unknown;
  offer_ttl?: number;
};

@Injectable()
export class YandexCargoClient {
  constructor(
    private readonly config: YandexDeliveryConfig,
    private readonly http: YandexHttpClient,
  ) {}

  async calculate(
    request: DeliveryQuoteRequest,
  ): Promise<DeliveryQuoteOption[]> {
    if (
      request.origin.longitude == null ||
      request.origin.latitude == null ||
      request.destination.longitude == null ||
      request.destination.latitude == null
    ) {
      throw new DeliveryProviderError(
        'ADDRESS_COORDINATES_REQUIRED',
        'Для экспресс-доставки нужны координаты отправления и назначения.',
      );
    }
    const response = await this.http.request<unknown>({
      contour: 'cargo',
      baseUrl: this.config.expressBaseUrl,
      token: this.config.expressToken,
      path: '/b2b/cargo/integration/v2/offers/calculate',
      correlationId: request.correlationId,
      body: {
        route_points: [
          {
            id: 1,
            coordinates: [request.origin.longitude, request.origin.latitude],
            fullname: request.origin.fullAddress,
            contact: {
              name: request.origin.contactName,
              phone: request.origin.contactPhone,
            },
          },
          {
            id: 2,
            coordinates: [
              request.destination.longitude,
              request.destination.latitude,
            ],
            fullname: request.destination.fullAddress,
            contact: {
              name: request.destination.recipientName,
              phone: request.destination.recipientPhone,
            },
          },
        ],
        items: request.packages.map((item, index) => ({
          id: `${item.orderItemId}:${item.packageSequence}:${index}`,
          pickup_point: 1,
          droppof_point: 2,
          title: item.sku ?? item.productId,
          quantity: item.quantity,
          size: {
            length: millimetersToMeters(item.lengthMillimeters),
            width: millimetersToMeters(item.widthMillimeters),
            height: millimetersToMeters(item.heightMillimeters),
          },
          weight: gramsToKilograms(item.weightGrams),
        })),
        requirements: {
          taxi_class: request.serviceCodes.includes('YANDEX_CARGO')
            ? 'cargo'
            : 'courier',
        },
      },
    });
    const offers = this.parseOffers(response);
    return offers.map((offer, index) => {
      const price = this.mapPrice(offer.price);
      return {
        serviceCode:
          offer.taxi_class === 'cargo' ? 'YANDEX_CARGO' : 'YANDEX_EXPRESS',
        title: getYandexOfferTitle(
          offer.description,
          offer.taxi_class === 'cargo' ? 'Грузовой' : 'Экспресс',
        ),
        description: offer.description,
        fulfillmentType: 'DOOR',
        providerCost: price.roundedBillingPrice,
        currency: 'RUB',
        pickupInterval: this.interval(offer.pickup_interval),
        deliveryInterval: this.interval(offer.delivery_interval),
        expiresAt: new Date(
          Date.now() +
            Math.min(
              offer.offer_ttl ?? this.config.quoteTtlSeconds,
              this.config.quoteTtlSeconds,
            ) *
              1000,
        ),
        providerOfferRef: `${offer.taxi_class ?? 'offer'}:${index}`,
        privateProviderPayload: offer.payload,
        rawProviderPrice: price,
        contour: 'cargo',
        mode: this.config.expressMode,
      };
    });
  }

  private parseOffers(value: unknown): CargoOffer[] {
    const record =
      value && typeof value === 'object'
        ? (value as Record<string, unknown>)
        : {};
    const raw = Array.isArray(record.offers)
      ? record.offers
      : Array.isArray(value)
        ? value
        : [];
    const offers = raw.filter((item): item is CargoOffer =>
      Boolean(item && typeof item === 'object' && 'price' in item),
    );
    if (!offers.length)
      throw new DeliveryProviderError(
        'NO_AVAILABLE_OFFERS',
        'Яндекс не вернул доступных вариантов доставки.',
      );
    return offers;
  }

  private interval(value?: { from?: string; to?: string }) {
    return value?.from && value.to
      ? { from: value.from, to: value.to }
      : undefined;
  }

  private mapPrice(price: CargoOffer['price']) {
    if (!price || typeof price !== 'object') {
      throw new DeliveryProviderError(
        'MALFORMED_PROVIDER_RESPONSE',
        'Яндекс вернул цену Cargo в неизвестном формате.',
      );
    }

    // Yandex bills the VAT-inclusive total. Using total_price or base_price here
    // would understate DNA's provider cost and could consume the sales margin.
    const billingPrice = price.total_price_with_vat;
    const roundedBillingPrice = normalizeDecimalRubles(billingPrice);

    return {
      basePrice: price.base_price,
      totalPrice: price.total_price,
      totalPriceWithVat: price.total_price_with_vat,
      surgeRatio: price.surge_ratio,
      currency: price.currency,
      billingPriceField: 'total_price_with_vat',
      billingPrice,
      roundedBillingPrice,
    };
  }
}
