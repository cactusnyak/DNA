import { ConfigService } from '@nestjs/config';

import { CdekDeliveryConfig } from './cdek-delivery.config';
import { CdekOAuthClient } from './cdek-oauth.client';

const response = (token: string, expiresIn = 3600) =>
  ({
    ok: true,
    json: () => Promise.resolve({ access_token: token, expires_in: expiresIn }),
  }) as Response;

describe('CdekOAuthClient', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  const create = () =>
    new CdekOAuthClient(
      new CdekDeliveryConfig(
        new ConfigService({
          CDEK_DELIVERY_ENABLED: true,
          CDEK_DELIVERY_MODE: 'test',
          CDEK_DELIVERY_ACCOUNT: 'test-account-placeholder',
          CDEK_DELIVERY_SECURE_PASSWORD: 'test-password-placeholder',
        }),
      ),
    );

  it('acquires once and reuses a cached token', async () => {
    global.fetch = jest.fn().mockResolvedValue(response('token-one'));
    const client = create();
    await expect(client.getToken()).resolves.toBe('token-one');
    await expect(client.getToken()).resolves.toBe('token-one');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('deduplicates concurrent acquisition', async () => {
    global.fetch = jest.fn().mockResolvedValue(response('token-one'));
    const client = create();
    await expect(
      Promise.all([client.getToken(), client.getToken(), client.getToken()]),
    ).resolves.toEqual(['token-one', 'token-one', 'token-one']);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('refreshes a token inside the configured skew', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(response('short', 30))
      .mockResolvedValueOnce(response('fresh'));
    const client = create();
    await expect(client.getToken()).resolves.toBe('short');
    await expect(client.getToken()).resolves.toBe('fresh');
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('does not include credential values in authentication errors', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false });
    await expect(create().getToken()).rejects.toThrow(
      'CDEK authentication failed',
    );
    try {
      await create().getToken();
    } catch (error) {
      expect(String(error)).not.toContain('test-password-placeholder');
      expect(String(error)).not.toContain('test-account-placeholder');
    }
  });
});
