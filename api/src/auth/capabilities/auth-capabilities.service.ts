import {
  ForbiddenException,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  AuthMethod,
  AuthOperation,
  isOAuthAuthMethod,
} from './auth-method.enum';

export type PublicAuthConfig = {
  login: {
    primaryMethod: AuthMethod;
    methods: AuthMethod[];
  };
  registration: {
    primaryMethod: AuthMethod;
    methods: AuthMethod[];
  };
};

const ALL_METHODS = Object.values(AuthMethod);

@Injectable()
export class AuthCapabilitiesService implements OnModuleInit {
  private readonly logger = new Logger(AuthCapabilitiesService.name);

  private loginMethods!: Set<AuthMethod>;
  private registrationMethods!: Set<AuthMethod>;
  private primaryLoginMethod!: AuthMethod;
  private primaryRegistrationMethod!: AuthMethod;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    this.loginMethods = this.parseMethods(
      'AUTH_LOGIN_METHODS',
      this.config.getOrThrow<string>('AUTH_LOGIN_METHODS'),
    );
    this.registrationMethods = this.parseMethods(
      'AUTH_REGISTRATION_METHODS',
      this.config.getOrThrow<string>('AUTH_REGISTRATION_METHODS'),
    );

    this.primaryLoginMethod = this.parsePrimaryMethod(
      'AUTH_PRIMARY_LOGIN_METHOD',
      this.config.getOrThrow<string>('AUTH_PRIMARY_LOGIN_METHOD'),
      this.loginMethods,
    );
    this.primaryRegistrationMethod = this.parsePrimaryMethod(
      'AUTH_PRIMARY_REGISTRATION_METHOD',
      this.config.getOrThrow<string>('AUTH_PRIMARY_REGISTRATION_METHOD'),
      this.registrationMethods,
    );

    this.assertProviderConfiguration(AuthOperation.LOGIN, this.loginMethods);
    this.assertProviderConfiguration(
      AuthOperation.REGISTRATION,
      this.registrationMethods,
    );

    this.logger.log(
      `Auth capabilities loaded: login=[${[...this.loginMethods].join(',')}] (primary=${this.primaryLoginMethod}), registration=[${[...this.registrationMethods].join(',')}] (primary=${this.primaryRegistrationMethod})`,
    );
  }

  isEnabled(method: AuthMethod, operation: AuthOperation): boolean {
    const methods =
      operation === AuthOperation.LOGIN
        ? this.loginMethods
        : this.registrationMethods;

    return methods.has(method);
  }

  assertEnabled(method: AuthMethod, operation: AuthOperation): void {
    if (!this.isEnabled(method, operation)) {
      throw new ForbiddenException(
        'This authentication method is not available',
      );
    }
  }

  getPublicConfig(): PublicAuthConfig {
    return {
      login: {
        primaryMethod: this.primaryLoginMethod,
        methods: [...this.loginMethods],
      },
      registration: {
        primaryMethod: this.primaryRegistrationMethod,
        methods: [...this.registrationMethods],
      },
    };
  }

  private parseMethods(envName: string, raw: string): Set<AuthMethod> {
    const values = raw
      .split(',')
      .map((value) => value.trim())
      .filter((value) => value.length > 0);

    if (values.length === 0) {
      throw new Error(`${envName} must not be empty`);
    }

    const seen = new Set<AuthMethod>();
    for (const value of values) {
      if (!ALL_METHODS.includes(value as AuthMethod)) {
        throw new Error(`${envName} contains unknown auth method: ${value}`);
      }

      const method = value as AuthMethod;
      if (seen.has(method)) {
        throw new Error(`${envName} contains duplicate auth method: ${value}`);
      }

      seen.add(method);
    }

    return seen;
  }

  private parsePrimaryMethod(
    envName: string,
    raw: string,
    enabledMethods: Set<AuthMethod>,
  ): AuthMethod {
    const value = raw.trim();

    if (!ALL_METHODS.includes(value as AuthMethod)) {
      throw new Error(`${envName} is not a known auth method: ${value}`);
    }

    const method = value as AuthMethod;

    if (!enabledMethods.has(method)) {
      throw new Error(
        `${envName} (${value}) must be included in the corresponding enabled methods list`,
      );
    }

    return method;
  }

  private assertProviderConfiguration(
    operation: AuthOperation,
    methods: Set<AuthMethod>,
  ) {
    if (methods.has(AuthMethod.OTP) || methods.has(AuthMethod.EMAIL_OTP)) {
      if (!this.config.get<string>('OTP_HASH_SECRET')) {
        throw new Error(
          `OTP is enabled for ${operation} but OTP_HASH_SECRET is not configured`,
        );
      }
    }

    if (methods.has(AuthMethod.YANDEX)) {
      const hasYandexConfig =
        this.config.get<string>('YANDEX_CLIENT_ID') &&
        this.config.get<string>('YANDEX_CLIENT_SECRET') &&
        this.config.get<string>('YANDEX_REDIRECT_URI');

      if (!hasYandexConfig) {
        throw new Error(
          `Yandex OAuth is enabled for ${operation} but YANDEX_CLIENT_ID/YANDEX_CLIENT_SECRET/YANDEX_REDIRECT_URI are not fully configured`,
        );
      }
    }

    if (methods.has(AuthMethod.EMAIL) || methods.has(AuthMethod.EMAIL_OTP)) {
      const provider = this.config.get<string>('EMAIL_DELIVERY_PROVIDER');

      if (provider === 'resend') {
        const hasResendConfig =
          this.config.get<string>('RESEND_API_KEY') &&
          this.config.get<string>('RESEND_FROM_EMAIL');

        if (!hasResendConfig) {
          throw new Error(
            `Email auth is enabled for ${operation} but Resend is not fully configured (RESEND_API_KEY/RESEND_FROM_EMAIL)`,
          );
        }
      } else if (
        provider === 'console' &&
        this.config.get<string>('NODE_ENV') === 'production'
      ) {
        throw new Error(
          `Email auth is enabled for ${operation} in production but EMAIL_DELIVERY_PROVIDER=console does not deliver real email`,
        );
      }

      if (!this.config.get<string>('JWT_SECRET')) {
        throw new Error('Email auth requires JWT_SECRET to be configured');
      }
    }

    for (const method of methods) {
      if (isOAuthAuthMethod(method) && method !== AuthMethod.YANDEX) {
        throw new Error(
          `Auth method ${method} is enabled for ${operation} but has no registered OAuth implementation`,
        );
      }
    }
  }
}
