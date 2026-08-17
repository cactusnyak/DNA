import type { ConfigService } from '@nestjs/config';

import { AuthCapabilitiesService } from './auth-capabilities.service';
import { AuthMethod, AuthOperation } from './auth-method.enum';

function buildConfig(overrides: Record<string, unknown> = {}) {
  const values: Record<string, unknown> = {
    AUTH_LOGIN_METHODS: 'email_otp,otp,yandex',
    AUTH_REGISTRATION_METHODS: 'email_otp,yandex',
    AUTH_PRIMARY_LOGIN_METHOD: 'email_otp',
    AUTH_PRIMARY_REGISTRATION_METHOD: 'email_otp',
    OTP_HASH_SECRET: 'a'.repeat(32),
    YANDEX_CLIENT_ID: 'client-id',
    YANDEX_CLIENT_SECRET: 'client-secret',
    YANDEX_REDIRECT_URI: 'https://example.com/callback',
    EMAIL_DELIVERY_PROVIDER: 'console',
    NODE_ENV: 'test',
    JWT_SECRET: 'secret',
    ...overrides,
  };

  return {
    get: (key: string) => values[key],
    getOrThrow: (key: string) => {
      if (values[key] === undefined) {
        throw new Error(`Missing config: ${key}`);
      }
      return values[key];
    },
  } as unknown as ConfigService;
}

describe('AuthCapabilitiesService', () => {
  it('parses enabled methods and primary methods from config', () => {
    const service = new AuthCapabilitiesService(buildConfig());
    service.onModuleInit();

    expect(service.getPublicConfig()).toEqual({
      login: {
        primaryMethod: 'email_otp',
        methods: ['email_otp', 'otp', 'yandex'],
      },
      registration: {
        primaryMethod: 'email_otp',
        methods: ['email_otp', 'yandex'],
      },
    });
  });

  it('rejects unknown auth methods', () => {
    const service = new AuthCapabilitiesService(
      buildConfig({ AUTH_LOGIN_METHODS: 'email,unknown' }),
    );

    expect(() => service.onModuleInit()).toThrow(/unknown auth method/);
  });

  it('rejects duplicate auth methods', () => {
    const service = new AuthCapabilitiesService(
      buildConfig({ AUTH_LOGIN_METHODS: 'email,email' }),
    );

    expect(() => service.onModuleInit()).toThrow(/duplicate auth method/);
  });

  it('rejects a primary method that is not enabled', () => {
    const service = new AuthCapabilitiesService(
      buildConfig({
        AUTH_PRIMARY_LOGIN_METHOD: 'otp',
        AUTH_LOGIN_METHODS: 'email,yandex',
      }),
    );

    expect(() => service.onModuleInit()).toThrow(/must be included/);
  });

  it('rejects OTP enabled without OTP_HASH_SECRET', () => {
    const service = new AuthCapabilitiesService(
      buildConfig({ OTP_HASH_SECRET: undefined }),
    );

    expect(() => service.onModuleInit()).toThrow(/OTP_HASH_SECRET/);
  });

  it('rejects Yandex enabled without full OAuth config', () => {
    const service = new AuthCapabilitiesService(
      buildConfig({ YANDEX_CLIENT_ID: undefined }),
    );

    expect(() => service.onModuleInit()).toThrow(/Yandex OAuth/);
  });

  it('rejects email enabled with resend provider missing credentials', () => {
    const service = new AuthCapabilitiesService(
      buildConfig({ EMAIL_DELIVERY_PROVIDER: 'resend' }),
    );

    expect(() => service.onModuleInit()).toThrow(
      /Resend is not fully configured/,
    );
  });

  it('rejects email OTP enabled with resend provider missing credentials', () => {
    const service = new AuthCapabilitiesService(
      buildConfig({
        EMAIL_DELIVERY_PROVIDER: 'resend',
        AUTH_LOGIN_METHODS: 'email_otp',
        AUTH_REGISTRATION_METHODS: 'email_otp',
      }),
    );

    expect(() => service.onModuleInit()).toThrow(
      /Resend is not fully configured/,
    );
  });

  it('rejects console email provider in production', () => {
    const service = new AuthCapabilitiesService(
      buildConfig({ NODE_ENV: 'production' }),
    );

    expect(() => service.onModuleInit()).toThrow(/does not deliver real email/);
  });

  it('isEnabled/assertEnabled reflect configured methods per operation', () => {
    const service = new AuthCapabilitiesService(
      buildConfig({ AUTH_REGISTRATION_METHODS: 'email_otp' }),
    );
    service.onModuleInit();

    expect(service.isEnabled(AuthMethod.OTP, AuthOperation.LOGIN)).toBe(true);
    expect(service.isEnabled(AuthMethod.OTP, AuthOperation.REGISTRATION)).toBe(
      false,
    );
    expect(() =>
      service.assertEnabled(AuthMethod.OTP, AuthOperation.REGISTRATION),
    ).toThrow();
  });
});
