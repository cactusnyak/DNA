/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { YandexCargoClient } from './yandex-cargo.client';

describe('YandexCargoClient', () => {
  it('maps the official offers/calculate contract and bills the VAT-inclusive total', async () => {
    const request = jest.fn().mockResolvedValue({
      offers: [
        {
          taxi_class: 'courier',
          description: 'express',
          price: {
            total_price: '100.01',
            total_price_with_vat: '120.01',
            base_price: '80.50',
            surge_ratio: '1.25',
            currency: 'RUB',
          },
          payload: { opaque: true },
          offer_ttl: 120,
        },
      ],
    });
    const client = new YandexCargoClient(
      {
        expressBaseUrl: 'https://b2b.taxi.yandex.net',
        expressToken: 'hidden',
        expressMode: 'production',
        quoteTtlSeconds: 600,
      } as never,
      { request } as never,
    );

    const options = await client.calculate({
      correlationId: 'correlation',
      groupKey: 'group',
      serviceCodes: ['YANDEX_EXPRESS'],
      origin: {
        country: 'Россия',
        city: 'Москва',
        fullAddress: 'A',
        latitude: 55.7,
        longitude: 37.6,
        contactName: 'A',
        contactPhone: '+79990000000',
      },
      destination: {
        country: 'Россия',
        city: 'Москва',
        fullAddress: 'B',
        latitude: 55.8,
        longitude: 37.7,
        recipientName: 'B',
        recipientPhone: '+79990000001',
      },
      packages: [
        {
          orderItemId: 'item',
          productId: 'product',
          quantity: 1,
          packageSequence: 0,
          type: 'BOX',
          weightGrams: 1250,
          lengthMillimeters: 800,
          widthMillimeters: 600,
          heightMillimeters: 500,
        },
      ],
    });

    const body = request.mock.calls[0][0].body;
    expect(body.route_points[0].coordinates).toEqual([37.6, 55.7]);
    expect(body.items[0].weight).toBe(1.25);
    expect(body.items[0].size).toEqual({
      length: 0.8,
      width: 0.6,
      height: 0.5,
    });
    expect(options[0].providerCost).toBe(121);
    expect(options[0].rawProviderPrice).toEqual({
      basePrice: '80.50',
      totalPrice: '100.01',
      totalPriceWithVat: '120.01',
      surgeRatio: '1.25',
      currency: 'RUB',
      billingPriceField: 'total_price_with_vat',
      billingPrice: '120.01',
      roundedBillingPrice: 121,
    });
    expect(options[0].privateProviderPayload).toEqual({ opaque: true });
  });

  it('does not fall back to a VAT-exclusive price', async () => {
    const request = jest.fn().mockResolvedValue({
      offers: [{ taxi_class: 'courier', price: { total_price: '100.01' } }],
    });
    const client = new YandexCargoClient(
      {
        expressBaseUrl: 'https://b2b.taxi.yandex.net',
        expressToken: 'hidden',
        expressMode: 'production',
        quoteTtlSeconds: 600,
      } as never,
      { request } as never,
    );

    await expect(
      client.calculate({
        correlationId: 'correlation',
        groupKey: 'group',
        serviceCodes: ['YANDEX_EXPRESS'],
        origin: {
          country: 'Россия',
          city: 'Москва',
          fullAddress: 'A',
          latitude: 55.7,
          longitude: 37.6,
          contactName: 'A',
          contactPhone: '+79990000000',
        },
        destination: {
          country: 'Россия',
          city: 'Москва',
          fullAddress: 'B',
          latitude: 55.8,
          longitude: 37.7,
          recipientName: 'B',
          recipientPhone: '+79990000001',
        },
        packages: [],
      }),
    ).rejects.toMatchObject({ code: 'MALFORMED_PROVIDER_RESPONSE' });
  });
});
