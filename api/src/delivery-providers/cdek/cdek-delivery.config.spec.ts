import { ConfigService } from '@nestjs/config';

import { CdekDeliveryConfig } from './cdek-delivery.config';

const make = (values: Record<string, unknown>) =>
  new CdekDeliveryConfig(
    new ConfigService({
      CDEK_DELIVERY_ENABLED: true,
      CDEK_DELIVERY_MODE: 'mock',
      ...values,
    }),
  );

describe('CdekDeliveryConfig', () => {
  it('supports credential-free mock mode', () => {
    expect(make({}).mode).toBe('mock');
  });

  it('requires credentials in test mode without revealing values', () => {
    expect(() => make({ CDEK_DELIVERY_MODE: 'test' })).toThrow(
      'CDEK_DELIVERY_ACCOUNT',
    );
  });

  it('rejects a production URL as the test URL', () => {
    expect(() =>
      make({
        CDEK_DELIVERY_TEST_BASE_URL: 'https://api.cdek.ru',
      }),
    ).toThrow('official CDEK test host');
  });

  it('rejects an educational URL as the production URL', () => {
    expect(() =>
      make({
        CDEK_DELIVERY_PRODUCTION_BASE_URL: 'https://api.edu.cdek.ru',
      }),
    ).toThrow('official CDEK production host');
  });
});
