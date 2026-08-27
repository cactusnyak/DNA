import { Injectable } from '@nestjs/common';

import type {
  DeliveryProviderAdapter,
  DeliveryQuoteOption,
  DeliveryQuoteRequest,
} from '../contracts/delivery-provider.types';
import { DeliveryProviderError } from '../delivery-provider.error';
import { normalizeDecimalRubles } from '../utils/logistics-units';
import { CdekDeliveryConfig } from './cdek-delivery.config';
import { CdekHttpClient, type CdekTariff } from './cdek-http.client';
import { CdekMockClient } from './cdek-mock.client';

type OriginConfig =
  | { originMode: 'DOOR' }
  | { originMode: 'CDEK_PVZ'; shipmentPoint: string };

@Injectable()
export class CdekDeliveryAdapter implements DeliveryProviderAdapter {
  readonly providerCode = 'CDEK';

  constructor(
    private readonly config: CdekDeliveryConfig,
    private readonly mock: CdekMockClient,
    private readonly http: CdekHttpClient,
  ) {}

  getCapabilities() {
    return {
      quoteCalculation: true,
      doorDelivery: true,
      pickupDelivery: false,
      scheduledIntervals: false,
      liveOrderCreation: false,
      cancellation: false,
      tracking: false,
      statusPolling: false,
      callbacks: false,
    };
  }

  async calculateQuotes(request: DeliveryQuoteRequest) {
    if (!this.config.enabled)
      throw new DeliveryProviderError('PROVIDER_DISABLED', 'CDEK is disabled.');
    if (!request.serviceCodes.includes('CDEK_COURIER')) return [];
    const origin = this.parseOrigin(request.warehouseProviderMetadata);
    const calculatorRequest = this.toCalculatorRequest(request, origin);
    const tariffs =
      this.config.mode === 'mock'
        ? this.mock.calculateTariffList(calculatorRequest)
        : await this.http.calculateTariffList(calculatorRequest);
    const options = tariffs.flatMap((tariff) => {
      try {
        const option = this.toOption(tariff, origin);
        return option ? [option] : [];
      } catch {
        return [];
      }
    });
    if (!options.length)
      throw new DeliveryProviderError(
        'NO_TARIFF_AVAILABLE',
        'CDEK has no compatible courier tariff for this route.',
      );
    return options.sort(
      (a, b) =>
        a.providerCost - b.providerCost ||
        this.periodEnd(a) - this.periodEnd(b) ||
        String(a.providerOfferRef).localeCompare(String(b.providerOfferRef)),
    );
  }

  toCalculatorRequest(request: DeliveryQuoteRequest, origin: OriginConfig) {
    const packages = request.packages.flatMap((item) => {
      const values = {
        weight: Math.ceil(item.weightGrams),
        length: Math.ceil(item.lengthMillimeters / 10),
        width: Math.ceil(item.widthMillimeters / 10),
        height: Math.ceil(item.heightMillimeters / 10),
      };
      if (
        !Number.isSafeInteger(values.weight) ||
        [values.weight, values.length, values.width, values.height].some(
          (value) => value <= 0,
        )
      )
        throw new DeliveryProviderError(
          'VALIDATION_ERROR',
          'Package dimensions and weight must be positive.',
        );
      if (!Number.isSafeInteger(item.quantity) || item.quantity <= 0)
        throw new DeliveryProviderError(
          'VALIDATION_ERROR',
          'Package quantity must be positive.',
        );
      return Array.from({ length: item.quantity }, (_, index) => ({
        number: `${item.orderItemId}-${item.packageSequence}-${index + 1}`,
        ...values,
      }));
    });
    if (!packages.length)
      throw new DeliveryProviderError(
        'VALIDATION_ERROR',
        'At least one package is required.',
      );
    return {
      type: 1,
      currency: 1,
      lang: 'rus',
      from_location: this.location(request.origin),
      to_location: this.location(request.destination),
      packages,
      ...(origin.originMode === 'CDEK_PVZ'
        ? { shipment_point: origin.shipmentPoint }
        : {}),
    };
  }

  private parseOrigin(value: unknown): OriginConfig {
    if (!value || typeof value !== 'object')
      throw new DeliveryProviderError(
        'WAREHOUSE_PROVIDER_NOT_CONFIGURED',
        'CDEK warehouse origin mode is not configured.',
      );
    const metadata = value as Record<string, unknown>;
    if (metadata.originMode === 'DOOR') return { originMode: 'DOOR' };
    if (
      metadata.originMode === 'CDEK_PVZ' &&
      typeof metadata.shipmentPoint === 'string' &&
      metadata.shipmentPoint.trim()
    )
      return {
        originMode: 'CDEK_PVZ',
        shipmentPoint: metadata.shipmentPoint.trim(),
      };
    throw new DeliveryProviderError(
      'WAREHOUSE_PROVIDER_NOT_CONFIGURED',
      'CDEK warehouse origin configuration is invalid.',
    );
  }

  private location(
    address:
      | DeliveryQuoteRequest['origin']
      | DeliveryQuoteRequest['destination'],
  ) {
    return {
      country_code: address.country.toUpperCase() === 'RU' ? 'RU' : 'RU',
      city: address.city,
      address: address.fullAddress,
      ...(address.postalCode ? { postal_code: address.postalCode } : {}),
      ...(Number.isFinite(address.latitude) &&
      Number.isFinite(address.longitude)
        ? { latitude: address.latitude, longitude: address.longitude }
        : {}),
    };
  }

  private toOption(
    tariff: CdekTariff,
    origin: OriginConfig,
  ): DeliveryQuoteOption | undefined {
    const mode = Number(tariff.delivery_mode);
    const expectedMode = origin.originMode === 'DOOR' ? 1 : 3;
    if (mode !== expectedMode) return undefined;
    const code = Number(tariff.tariff_code);
    const periodMin = Number(tariff.period_min);
    const periodMax = Number(tariff.period_max);
    if (
      !Number.isSafeInteger(code) ||
      code <= 0 ||
      !Number.isSafeInteger(periodMin) ||
      !Number.isSafeInteger(periodMax) ||
      periodMin <= 0 ||
      periodMax < periodMin
    )
      throw new Error('Malformed tariff');
    if (tariff.currency !== undefined && tariff.currency !== 'RUB')
      throw new Error('Unsupported currency');
    const providerCost = normalizeDecimalRubles(tariff.delivery_sum);
    const range = this.deliveryRange(tariff.delivery_date_range);
    return {
      serviceCode: 'CDEK_COURIER',
      title:
        typeof tariff.tariff_name === 'string'
          ? tariff.tariff_name
          : 'СДЭК — доставка до двери',
      description:
        typeof tariff.tariff_description === 'string'
          ? tariff.tariff_description
          : `Срок доставки: ${periodMin}–${periodMax} дн.`,
      fulfillmentType: 'DOOR',
      providerCost,
      currency: 'RUB',
      ...(range ? { deliveryInterval: range } : {}),
      expiresAt: new Date(Date.now() + this.config.quoteTtlSeconds * 1000),
      providerOfferRef: `tariff:${code}:mode:${mode}`,
      privateProviderPayload: {
        tariffCode: code,
        deliveryMode: mode,
        periodMin,
        periodMax,
      },
      rawProviderPrice: { deliverySum: providerCost, currency: 'RUB' },
      contour: 'cdek',
      mode: this.config.mode,
    };
  }

  private deliveryRange(value: unknown) {
    if (!value || typeof value !== 'object') return undefined;
    const range = value as Record<string, unknown>;
    const from =
      typeof range.min === 'string' ? new Date(range.min) : undefined;
    const to = typeof range.max === 'string' ? new Date(range.max) : undefined;
    if (
      !from ||
      !to ||
      !Number.isFinite(from.getTime()) ||
      !Number.isFinite(to.getTime())
    )
      return undefined;
    return { from: from.toISOString(), to: to.toISOString() };
  }

  private periodEnd(option: DeliveryQuoteOption) {
    const payload = option.privateProviderPayload as { periodMax: number };
    return payload.periodMax;
  }
}
