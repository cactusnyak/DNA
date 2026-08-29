import { ConfigService } from '@nestjs/config';

import type { DeliveryQuoteRequest } from '../contracts/delivery-provider.types';
import { CdekDeliveryAdapter } from './cdek-delivery.adapter';
import { CdekDeliveryConfig } from './cdek-delivery.config';
import { CdekMockClient } from './cdek-mock.client';

const request = (
  metadata: unknown = { originMode: 'DOOR' },
): DeliveryQuoteRequest => ({
  correlationId: 'correlation',
  groupKey: 'group',
  serviceCodes: ['CDEK_COURIER'],
  warehouseProviderMetadata: metadata,
  origin: {
    country: 'Россия',
    city: 'Москва',
    fullAddress: 'Москва, синтетический адрес 1',
    postalCode: '101000',
    contactName: 'Test Warehouse',
    contactPhone: '+79990000000',
  },
  destination: {
    country: 'Россия',
    city: 'Санкт-Петербург',
    fullAddress: 'Санкт-Петербург, синтетический адрес 1',
    postalCode: '190000',
    recipientName: 'Test Recipient',
    recipientPhone: '+79990000001',
  },
  packages: [
    {
      orderItemId: 'item',
      productId: 'product',
      quantity: 2,
      packageSequence: 0,
      type: 'BOX',
      weightGrams: 501,
      lengthMillimeters: 101,
      widthMillimeters: 202,
      heightMillimeters: 303,
    },
  ],
});

const createAdapter = () => {
  const config = new CdekDeliveryConfig(
    new ConfigService({
      CDEK_DELIVERY_ENABLED: true,
      CDEK_DELIVERY_MODE: 'mock',
    }),
  );
  const mock = new CdekMockClient();
  return { adapter: new CdekDeliveryAdapter(config, mock, {} as never), mock };
};

describe('CdekDeliveryAdapter', () => {
  it('preserves packages and converts grams/centimetres with safe rounding', async () => {
    const { adapter, mock } = createAdapter();
    const spy = jest.spyOn(mock, 'calculateTariffList');
    await adapter.calculateQuotes(request());
    expect(spy.mock.calls[0][0].packages).toEqual([
      { number: 'item-0-1', weight: 501, length: 11, width: 21, height: 31 },
      { number: 'item-0-2', weight: 501, length: 11, width: 21, height: 31 },
    ]);
  });

  it('returns deterministic courier variants and ignores malformed entries', async () => {
    const { adapter } = createAdapter();
    const quotes = await adapter.calculateQuotes(request());
    expect(quotes).toHaveLength(2);
    expect(quotes.map(({ providerOfferRef }) => providerOfferRef)).toEqual([
      'tariff:137:mode:1',
      'tariff:233:mode:1',
    ]);
    expect(
      quotes.every(({ fulfillmentType }) => fulfillmentType === 'DOOR'),
    ).toBe(true);
  });

  it('uses shipment_point and warehouse-to-door mode for a PVZ origin', async () => {
    const { adapter, mock } = createAdapter();
    const spy = jest.spyOn(mock, 'calculateTariffList');
    const quotes = await adapter.calculateQuotes(
      request({ originMode: 'CDEK_PVZ', shipmentPoint: 'SYNTHETIC-PVZ' }),
    );
    expect(spy.mock.calls[0][0].shipment_point).toBe('SYNTHETIC-PVZ');
    expect(quotes.map(({ providerOfferRef }) => providerOfferRef)).toEqual([
      'tariff:136:mode:3',
      'tariff:234:mode:3',
    ]);
  });

  it('rejects missing provider-specific origin metadata', async () => {
    const { adapter } = createAdapter();
    await expect(adapter.calculateQuotes(request(null))).rejects.toMatchObject({
      code: 'WAREHOUSE_PROVIDER_NOT_CONFIGURED',
    });
  });
});
