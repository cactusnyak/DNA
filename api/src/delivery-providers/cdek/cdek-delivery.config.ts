import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type CdekDeliveryMode = 'mock' | 'test' | 'live';

@Injectable()
export class CdekDeliveryConfig {
  static readonly testHost = 'https://api.edu.cdek.ru';
  static readonly productionHost = 'https://api.cdek.ru';

  readonly enabled: boolean;
  readonly mode: CdekDeliveryMode;
  readonly timeoutMs: number;
  readonly tokenRefreshSkewSeconds: number;
  readonly quoteTtlSeconds: number;
  readonly testBaseUrl: string;
  readonly productionBaseUrl: string;
  readonly account: string;
  readonly securePassword: string;
  readonly liveMutationsEnabled: boolean;

  constructor(config: ConfigService) {
    this.enabled = config.get<boolean>('CDEK_DELIVERY_ENABLED', false);
    this.mode = config.get<CdekDeliveryMode>('CDEK_DELIVERY_MODE', 'mock');
    this.timeoutMs = config.get<number>('CDEK_DELIVERY_TIMEOUT_MS', 10_000);
    this.tokenRefreshSkewSeconds = config.get<number>(
      'CDEK_DELIVERY_TOKEN_REFRESH_SKEW_SECONDS',
      60,
    );
    this.quoteTtlSeconds = config.get<number>(
      'CDEK_DELIVERY_QUOTE_TTL_SECONDS',
      600,
    );
    this.testBaseUrl = this.normalizeUrl(
      config.get<string>(
        'CDEK_DELIVERY_TEST_BASE_URL',
        CdekDeliveryConfig.testHost,
      ),
    );
    this.productionBaseUrl = this.normalizeUrl(
      config.get<string>(
        'CDEK_DELIVERY_PRODUCTION_BASE_URL',
        CdekDeliveryConfig.productionHost,
      ),
    );
    this.account = config.get<string>('CDEK_DELIVERY_ACCOUNT', '').trim();
    this.securePassword = config
      .get<string>('CDEK_DELIVERY_SECURE_PASSWORD', '')
      .trim();
    this.liveMutationsEnabled = config.get<boolean>(
      'CDEK_DELIVERY_LIVE_MUTATIONS_ENABLED',
      false,
    );
    this.validate();
  }

  get baseUrl() {
    return this.mode === 'live' ? this.productionBaseUrl : this.testBaseUrl;
  }

  private normalizeUrl(value: string) {
    return value.replace(/\/+$/, '');
  }

  private validate() {
    if (!['mock', 'test', 'live'].includes(this.mode))
      throw new Error('CDEK_DELIVERY_MODE must be mock, test, or live');
    if (this.testBaseUrl !== CdekDeliveryConfig.testHost)
      throw new Error(
        'CDEK_DELIVERY_TEST_BASE_URL must be the official CDEK test host',
      );
    if (this.productionBaseUrl !== CdekDeliveryConfig.productionHost)
      throw new Error(
        'CDEK_DELIVERY_PRODUCTION_BASE_URL must be the official CDEK production host',
      );
    if (this.mode === 'test' && this.baseUrl !== CdekDeliveryConfig.testHost)
      throw new Error('CDEK_DELIVERY_MODE=test requires the CDEK test host');
    if (
      this.mode === 'live' &&
      this.baseUrl !== CdekDeliveryConfig.productionHost
    )
      throw new Error(
        'CDEK_DELIVERY_MODE=live requires the CDEK production host',
      );
    if (
      this.enabled &&
      this.mode !== 'mock' &&
      (!this.account || !this.securePassword)
    )
      throw new Error(
        'CDEK_DELIVERY_ACCOUNT and CDEK_DELIVERY_SECURE_PASSWORD are required outside mock mode',
      );
  }
}
