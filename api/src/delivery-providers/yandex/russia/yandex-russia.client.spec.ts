/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment */
import { YandexRussiaClient } from './yandex-russia.client';

describe('YandexRussiaClient', () => {
  it('uses the official pricing-calculator address contract', async () => {
    const request = jest.fn().mockResolvedValue({
      pricing_total: '225.7 RUB',
      delivery_days: 7,
    });
    const client = new YandexRussiaClient(
      {
        russiaMode: 'sandbox',
        russiaStationId: 'station',
        russiaBaseUrl: 'https://example.test',
        russiaToken: 'test-token',
        quoteTtlSeconds: 600,
      } as any,
      { request } as any,
    );
    const [option] = await client.calculate({
      correlationId: 'correlation',
      groupKey: 'internal',
      serviceCodes: ['YANDEX_RUSSIA_DOOR'],
      origin: {
        country: 'Россия',
        city: 'Москва',
        fullAddress: 'Склад',
        contactName: 'DNA',
        contactPhone: '+79990000000',
      },
      destination: {
        country: 'Россия',
        city: 'Москва',
        fullAddress: 'Москва, Тверская, 1',
        recipientName: 'Иван',
        recipientPhone: '+79990000000',
      },
      packages: [
        {
          orderItemId: 'item',
          productId: 'product',
          quantity: 1,
          packageSequence: 0,
          type: 'BOX',
          weightGrams: 1000,
          lengthMillimeters: 100,
          widthMillimeters: 200,
          heightMillimeters: 300,
        },
      ],
    });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          source: { platform_station_id: 'station' },
          destination: { address: 'Москва, Тверская, 1' },
          tariff: 'time_interval',
        }),
      }),
    );
    expect(option.providerCost).toBe(226);
    expect(option.deliveryInterval).toBeUndefined();
  });

  it('sends location/detect the documented location field', async () => {
    const request = jest.fn().mockResolvedValue({ variants: [] });
    const client = new YandexRussiaClient(
      {
        russiaBaseUrl: 'https://example.test',
        russiaToken: 'test-token',
      } as any,
      { request } as any,
    );
    await client.detectLocation('Москва', 'correlation');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        body: { location: 'Москва' },
      }),
    );
  });
});
