import { ConfigService } from '@nestjs/config';

import { CdekDeliveryConfig } from './cdek-delivery.config';
import { CdekHttpClient } from './cdek-http.client';

describe('CdekHttpClient', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  const config = () =>
    new CdekDeliveryConfig(
      new ConfigService({
        CDEK_DELIVERY_ENABLED: true,
        CDEK_DELIVERY_MODE: 'test',
        CDEK_DELIVERY_ACCOUNT: 'account-placeholder',
        CDEK_DELIVERY_SECURE_PASSWORD: 'password-placeholder',
      }),
    );

  it('invalidates authentication and retries exactly once after 401', async () => {
    const oauth = {
      getToken: jest
        .fn()
        .mockResolvedValueOnce('old')
        .mockResolvedValueOnce('new'),
      invalidate: jest.fn(),
    };
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({ status: 401, ok: false })
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: () => Promise.resolve({ tariff_codes: [{ tariff_code: 1 }] }),
      });
    const client = new CdekHttpClient(config(), oauth as never);
    await expect(
      client.calculateTariffList({ synthetic: true }),
    ).resolves.toEqual([{ tariff_code: 1 }]);
    expect(oauth.invalidate).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('fails after the single authentication retry', async () => {
    const oauth = {
      getToken: jest.fn().mockResolvedValue('token'),
      invalidate: jest.fn(),
    };
    global.fetch = jest.fn().mockResolvedValue({ status: 401, ok: false });
    const client = new CdekHttpClient(config(), oauth as never);
    await expect(
      client.calculateTariffList({ synthetic: true }),
    ).rejects.toMatchObject({
      code: 'PROVIDER_UNAUTHORIZED',
    });
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
