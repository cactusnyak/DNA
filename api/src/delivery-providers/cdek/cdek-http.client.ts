import { Injectable } from '@nestjs/common';

import { DeliveryProviderError } from '../delivery-provider.error';
import { CdekDeliveryConfig } from './cdek-delivery.config';
import { CdekOAuthClient } from './cdek-oauth.client';

export type CdekTariff = Record<string, unknown>;
export type CdekTariffListRequest = Record<string, unknown>;

@Injectable()
export class CdekHttpClient {
  constructor(
    private readonly config: CdekDeliveryConfig,
    private readonly oauth: CdekOAuthClient,
  ) {}

  async calculateTariffList(body: CdekTariffListRequest) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const token = await this.oauth.getToken();
      const response = await this.post(
        '/v2/calculator/tarifflist',
        body,
        token,
      );
      if (response.status === 401) {
        this.oauth.invalidate();
        if (attempt === 0) continue;
        throw new DeliveryProviderError(
          'PROVIDER_UNAUTHORIZED',
          'CDEK authentication failed.',
          false,
          503,
        );
      }
      if (response.status === 400 || response.status === 422)
        throw new DeliveryProviderError(
          'PROVIDER_VALIDATION_ERROR',
          'CDEK rejected the delivery parameters.',
        );
      if (response.status >= 500)
        throw new DeliveryProviderError(
          'PROVIDER_UNAVAILABLE',
          'CDEK is temporarily unavailable.',
          true,
          503,
        );
      if (!response.ok)
        throw new DeliveryProviderError(
          'PROVIDER_REQUEST_FAILED',
          'CDEK rejected the quote request.',
        );
      const payload = (await response.json()) as Record<string, unknown>;
      if (!Array.isArray(payload.tariff_codes))
        throw new DeliveryProviderError(
          'MALFORMED_PROVIDER_RESPONSE',
          'CDEK returned a malformed tariff list.',
          false,
          503,
        );
      return payload.tariff_codes as CdekTariff[];
    }
    return [];
  }

  private async post(path: string, body: unknown, token: string) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);
    try {
      return await fetch(`${this.config.baseUrl}${path}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept-Language': 'ru',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch {
      throw new DeliveryProviderError(
        'PROVIDER_TIMEOUT',
        'CDEK did not respond in time.',
        true,
        503,
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}
