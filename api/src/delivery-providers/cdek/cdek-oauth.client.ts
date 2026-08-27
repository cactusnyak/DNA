import { Injectable } from '@nestjs/common';

import { DeliveryProviderError } from '../delivery-provider.error';
import { CdekDeliveryConfig } from './cdek-delivery.config';

type CachedToken = { value: string; expiresAt: number };

@Injectable()
export class CdekOAuthClient {
  private token?: CachedToken;
  private refresh?: Promise<string>;

  constructor(private readonly config: CdekDeliveryConfig) {}

  async getToken(): Promise<string> {
    const now = Date.now();
    if (
      this.token &&
      this.token.expiresAt - this.config.tokenRefreshSkewSeconds * 1000 > now
    )
      return this.token.value;
    if (!this.refresh)
      this.refresh = this.acquire().finally(() => (this.refresh = undefined));
    return this.refresh;
  }

  invalidate() {
    this.token = undefined;
  }

  private async acquire(): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);
    try {
      const query = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.config.account,
        client_secret: this.config.securePassword,
      });
      const response = await fetch(
        `${this.config.baseUrl}/v2/oauth/token?${query}`,
        {
          method: 'POST',
          signal: controller.signal,
        },
      );
      if (!response.ok)
        throw new DeliveryProviderError(
          'PROVIDER_UNAUTHORIZED',
          'CDEK authentication failed.',
          false,
          503,
        );
      const body = (await response.json()) as Record<string, unknown>;
      const value =
        typeof body.access_token === 'string' ? body.access_token : '';
      const expiresIn = Number(body.expires_in);
      if (!value || !Number.isFinite(expiresIn) || expiresIn <= 0)
        throw new DeliveryProviderError(
          'MALFORMED_PROVIDER_RESPONSE',
          'CDEK returned a malformed authentication response.',
          false,
          503,
        );
      this.token = { value, expiresAt: Date.now() + expiresIn * 1000 };
      return value;
    } catch (error) {
      if (error instanceof DeliveryProviderError) throw error;
      throw new DeliveryProviderError(
        'PROVIDER_TIMEOUT',
        'CDEK authentication did not respond in time.',
        true,
        503,
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}
