import { Injectable, Logger } from '@nestjs/common';

import { DeliveryProviderError } from '../delivery-provider.error';
import { YandexDeliveryConfig } from './yandex-delivery.config';

@Injectable()
export class YandexHttpClient {
  private readonly logger = new Logger(YandexHttpClient.name);
  constructor(private readonly config: YandexDeliveryConfig) {}

  async request<T>(params: {
    contour: string;
    baseUrl: string;
    token: string;
    method?: 'GET' | 'POST';
    path: string;
    body?: unknown;
    correlationId: string;
  }): Promise<T> {
    const startedAt = Date.now();
    let lastError: unknown;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(
        () => controller.abort(),
        this.config.timeoutMs,
      );
      try {
        const response = await fetch(`${params.baseUrl}${params.path}`, {
          method: params.method ?? 'POST',
          headers: {
            Authorization: `Bearer ${params.token}`,
            'Content-Type': 'application/json',
            'Accept-Language': 'ru',
          },
          body:
            params.body === undefined ? undefined : JSON.stringify(params.body),
          signal: controller.signal,
        });
        this.logger.log(
          JSON.stringify({
            event: 'delivery_provider.request',
            provider: 'YANDEX',
            contour: params.contour,
            method: params.method ?? 'POST',
            status: response.status,
            durationMs: Date.now() - startedAt,
            correlationId: params.correlationId,
          }),
        );
        if (response.status === 401 || response.status === 403)
          throw new DeliveryProviderError(
            'PROVIDER_UNAUTHORIZED',
            'Провайдер доставки не авторизован.',
          );
        if (response.status === 429)
          lastError = new DeliveryProviderError(
            'PROVIDER_RATE_LIMITED',
            'Провайдер временно ограничил запросы.',
            true,
            503,
          );
        else if (response.status >= 500)
          lastError = new DeliveryProviderError(
            'PROVIDER_UNAVAILABLE',
            'Провайдер доставки временно недоступен.',
            true,
            503,
          );
        else if (!response.ok)
          throw new DeliveryProviderError(
            'PROVIDER_VALIDATION_ERROR',
            'Провайдер отклонил параметры доставки.',
          );
        else return (await response.json()) as T;
      } catch (error) {
        if (error instanceof DeliveryProviderError && !error.retriable)
          throw error;
        lastError = error;
      } finally {
        clearTimeout(timeout);
      }
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          100 * 2 ** attempt + Math.floor(Math.random() * 50),
        ),
      );
    }
    if (lastError instanceof DeliveryProviderError) throw lastError;
    throw new DeliveryProviderError(
      'PROVIDER_TIMEOUT',
      'Провайдер доставки не ответил вовремя.',
      true,
      503,
    );
  }
}
