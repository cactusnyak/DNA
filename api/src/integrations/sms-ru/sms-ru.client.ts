import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { SmsRuError, mapSmsRuStatus } from './sms-ru.errors';
import type { SmsRuResponse } from './sms-ru.types';

@Injectable()
export class SmsRuClient {
  constructor(private readonly config: ConfigService) {}

  async send(input: {
    phone: string;
    message: string;
    clientIp?: string;
    ttlMinutes: number;
  }) {
    const body = new URLSearchParams({
      api_id: this.config.getOrThrow<string>('SMS_RU_API_ID'),
      to: input.phone,
      msg: input.message,
      json: '1',
      from: this.config.getOrThrow<string>('SMS_RU_SENDER_NAME'),
      ttl: String(Math.min(1440, Math.max(1, input.ttlMinutes))),
    });
    if (input.clientIp) body.set('ip', input.clientIp);
    if (this.config.get<boolean>('SMS_RU_TEST_MODE')) body.set('test', '1');

    const response = await this.post('/sms/send', body);
    if (response.status !== 'OK' || response.status_code !== 100) {
      throw new SmsRuError(
        mapSmsRuStatus(response.status_code),
        response.status_code,
      );
    }

    const item = response.sms?.[input.phone];
    if (
      !item ||
      item.status !== 'OK' ||
      item.status_code !== 100 ||
      !item.sms_id
    ) {
      throw new SmsRuError(
        mapSmsRuStatus(item?.status_code),
        item?.status_code,
      );
    }

    return {
      messageId: item.sms_id,
      statusCode: item.status_code,
      balance: response.balance,
    };
  }

  authCheck() {
    return this.accountRequest('/auth/check');
  }
  senders() {
    return this.accountRequest('/my/senders');
  }
  balance() {
    return this.accountRequest('/my/balance');
  }
  limit() {
    return this.accountRequest('/my/limit');
  }

  callback(action: 'add' | 'get' | 'del', url?: string) {
    const body = this.accountBody();
    if (url) body.set('url', url);
    return this.post(`/callback/${action}`, body);
  }

  private accountRequest(path: string) {
    return this.post(path, this.accountBody());
  }

  private accountBody() {
    return new URLSearchParams({
      api_id: this.config.getOrThrow<string>('SMS_RU_API_ID'),
      json: '1',
    });
  }

  private async post(
    path: string,
    body: URLSearchParams,
  ): Promise<SmsRuResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      this.config.getOrThrow<number>('SMS_RU_REQUEST_TIMEOUT_MS'),
    );
    try {
      const response = await fetch(
        new URL(path, this.config.getOrThrow<string>('SMS_RU_BASE_URL')),
        {
          method: 'POST',
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
          body,
          signal: controller.signal,
        },
      );
      if (!response.ok)
        throw new SmsRuError('PROVIDER_TEMPORARILY_UNAVAILABLE');
      const json: unknown = await response.json();
      if (!json || typeof json !== 'object')
        throw new SmsRuError('UNKNOWN_PROVIDER_ERROR');
      return json;
    } catch (error) {
      if (error instanceof SmsRuError) throw error;
      throw new SmsRuError('PROVIDER_TEMPORARILY_UNAVAILABLE');
    } finally {
      clearTimeout(timeout);
    }
  }
}
