import { ConfigService } from '@nestjs/config';

import { SmsRuClient } from './sms-ru.client';
import { SmsRuError } from './sms-ru.errors';

describe('SmsRuClient', () => {
  const values: Record<string, unknown> = {
    SMS_RU_API_ID: 'secret-api-id',
    SMS_RU_BASE_URL: 'https://sms.ru',
    SMS_RU_SENDER_NAME: 'DNA',
    SMS_RU_TEST_MODE: true,
    SMS_RU_REQUEST_TIMEOUT_MS: 1000,
  };
  const config = {
    get: jest.fn((key: string) => values[key]),
    getOrThrow: jest.fn((key: string) => values[key]),
  } as unknown as ConfigService;
  let client: SmsRuClient;

  beforeEach(() => {
    client = new SmsRuClient(config);
    jest.restoreAllMocks();
  });

  it('sends POST form data and accepts only the recipient status 100', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          status: 'OK',
          status_code: 100,
          balance: 10,
          sms: {
            '79991234567': { status: 'OK', status_code: 100, sms_id: 'id-1' },
          },
        }),
        { status: 200 },
      ),
    );
    const result = await client.send({
      phone: '79991234567',
      message: 'Код: 123456',
      clientIp: '203.0.113.2',
      ttlMinutes: 5,
    });
    expect(result).toEqual({ messageId: 'id-1', statusCode: 100, balance: 10 });
    const [url, init] = fetchMock.mock.calls[0];
    expect((url as URL).toString()).toBe('https://sms.ru/sms/send');
    expect(init?.method).toBe('POST');
    const body = init?.body as URLSearchParams;
    expect(body.get('api_id')).toBe('secret-api-id');
    expect(body.get('test')).toBe('1');
    expect(body.get('ip')).toBe('203.0.113.2');
    expect((url as URL).toString()).not.toContain('secret-api-id');
  });

  it.each([
    [200, 'PROVIDER_AUTH_ERROR'],
    [201, 'PROVIDER_BALANCE_ERROR'],
    [207, 'INVALID_RECIPIENT'],
    [204, 'PROVIDER_CONFIGURATION_ERROR'],
    [221, 'PROVIDER_CONFIGURATION_ERROR'],
    [222, 'PROVIDER_CONFIGURATION_ERROR'],
    [230, 'RATE_LIMITED'],
    [500, 'PROVIDER_TEMPORARILY_UNAVAILABLE'],
  ])('maps provider code %s to %s', async (code, category) => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ status: 'ERROR', status_code: code }), {
        status: 200,
      }),
    );
    await expect(
      client.send({ phone: '79991234567', message: 'x', ttlMinutes: 1 }),
    ).rejects.toMatchObject({ category, providerStatusCode: code });
  });

  it('rejects a malformed or missing recipient result', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(
        new Response(
          JSON.stringify({ status: 'OK', status_code: 100, sms: {} }),
          { status: 200 },
        ),
      );
    await expect(
      client.send({ phone: '79991234567', message: 'x', ttlMinutes: 1 }),
    ).rejects.toBeInstanceOf(SmsRuError);
  });

  it('does not add test=1 when test mode is disabled', async () => {
    values.SMS_RU_TEST_MODE = false;
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          status: 'OK',
          status_code: 100,
          sms: {
            '79991234567': { status: 'OK', status_code: 100, sms_id: 'id-1' },
          },
        }),
        { status: 200 },
      ),
    );
    await client.send({ phone: '79991234567', message: 'x', ttlMinutes: 1 });
    expect(
      (fetchMock.mock.calls[0][1]?.body as URLSearchParams).has('test'),
    ).toBe(false);
    values.SMS_RU_TEST_MODE = true;
  });

  it('maps network and malformed JSON failures without exposing credentials', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('network'));
    await expect(
      client.send({ phone: '79991234567', message: 'x', ttlMinutes: 1 }),
    ).rejects.toMatchObject({ category: 'PROVIDER_TEMPORARILY_UNAVAILABLE' });
    try {
      await client.send({ phone: '79991234567', message: 'x', ttlMinutes: 1 });
    } catch (error) {
      expect((error as Error).message).not.toContain('secret-api-id');
    }
  });
});
