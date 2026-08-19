import { ConfigService } from '@nestjs/config';

import { YandexDeliveryConfig } from './yandex-delivery.config';

const make = (values: Record<string, unknown>) =>
  new YandexDeliveryConfig(
    new ConfigService({
      YANDEX_DELIVERY_ENABLED: true,
      YANDEX_EXPRESS_MODE: 'mock',
      YANDEX_RUSSIA_MODE: 'mock',
      ...values,
    }),
  );

describe('YandexDeliveryConfig', () => {
  it('uses network-free mock modes by default', () => {
    const config = make({});
    expect(config.expressMode).toBe('mock');
    expect(config.russiaMode).toBe('mock');
  });

  it('rejects a production mode with a non-production host', () => {
    expect(() =>
      make({
        YANDEX_EXPRESS_MODE: 'production',
        YANDEX_EXPRESS_BASE_URL: 'https://example.com',
        YANDEX_EXPRESS_TOKEN: 'secret',
      }),
    ).toThrow('production host');
  });

  it('rejects sandbox mode with a production host', () => {
    expect(() =>
      make({
        YANDEX_RUSSIA_MODE: 'sandbox',
        YANDEX_RUSSIA_BASE_URL: 'https://b2b-authproxy.taxi.yandex.net',
        YANDEX_RUSSIA_TOKEN: 'secret',
      }),
    ).toThrow('sandbox host');
  });
});
