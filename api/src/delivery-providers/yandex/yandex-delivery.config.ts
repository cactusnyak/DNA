import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type YandexExpressMode = 'mock' | 'manager_test' | 'production';
export type YandexRussiaMode = 'mock' | 'sandbox' | 'production';

@Injectable()
export class YandexDeliveryConfig {
  readonly enabled: boolean;
  readonly timeoutMs: number;
  readonly quoteTtlSeconds: number;
  readonly expressEnabled: boolean;
  readonly expressMode: YandexExpressMode;
  readonly expressBaseUrl: string;
  readonly expressToken: string;
  readonly russiaEnabled: boolean;
  readonly russiaMode: YandexRussiaMode;
  readonly russiaBaseUrl: string;
  readonly russiaToken: string;
  readonly russiaStationId: string;

  constructor(config: ConfigService) {
    this.enabled = config.get<boolean>('YANDEX_DELIVERY_ENABLED', false);
    this.timeoutMs = config.get<number>('YANDEX_DELIVERY_TIMEOUT_MS', 5000);
    this.quoteTtlSeconds = config.get<number>(
      'YANDEX_DELIVERY_QUOTE_TTL_SECONDS',
      600,
    );
    this.expressEnabled = config.get<boolean>('YANDEX_EXPRESS_ENABLED', true);
    this.expressMode = config.get<YandexExpressMode>(
      'YANDEX_EXPRESS_MODE',
      'mock',
    );
    this.expressBaseUrl = config.get<string>(
      'YANDEX_EXPRESS_BASE_URL',
      'https://b2b.taxi.yandex.net',
    );
    this.expressToken =
      config.get<string>('YANDEX_EXPRESS_TOKEN') ||
      config.get<string>('YANDEX_DELIVERY_TOKEN', '');
    this.russiaEnabled = config.get<boolean>('YANDEX_RUSSIA_ENABLED', true);
    this.russiaMode = config.get<YandexRussiaMode>(
      'YANDEX_RUSSIA_MODE',
      'mock',
    );
    this.russiaBaseUrl = config.get<string>(
      'YANDEX_RUSSIA_BASE_URL',
      'https://b2b.taxi.tst.yandex.net',
    );
    this.russiaToken =
      config.get<string>('YANDEX_RUSSIA_TOKEN') ||
      config.get<string>('YANDEX_DELIVERY_TOKEN', '');
    this.russiaStationId = config.get<string>('YANDEX_RUSSIA_STATION_ID', '');
    this.validate();
  }

  private validate() {
    if (!this.enabled) return;
    const expressProductionHost = 'https://b2b.taxi.yandex.net';
    const russiaProductionHost = 'https://b2b-authproxy.taxi.yandex.net';
    const russiaSandboxHost = 'https://b2b.taxi.tst.yandex.net';
    if (
      this.expressMode === 'production' &&
      this.expressBaseUrl !== expressProductionHost
    )
      throw new Error(
        'YANDEX_EXPRESS_MODE=production requires the production host',
      );
    if (this.expressMode !== 'mock' && !this.expressToken)
      throw new Error('YANDEX_EXPRESS_TOKEN is required outside mock mode');
    if (
      this.russiaMode === 'production' &&
      this.russiaBaseUrl !== russiaProductionHost
    )
      throw new Error(
        'YANDEX_RUSSIA_MODE=production requires the production host',
      );
    if (
      this.russiaMode === 'sandbox' &&
      this.russiaBaseUrl !== russiaSandboxHost
    )
      throw new Error('YANDEX_RUSSIA_MODE=sandbox requires the sandbox host');
    if (this.russiaMode !== 'mock' && !this.russiaToken)
      throw new Error('YANDEX_RUSSIA_TOKEN is required outside mock mode');
  }
}
