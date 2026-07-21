import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';

import type { YookassaPayment, YookassaWebhookPayload } from './types/yookassa.types';

@Injectable()
export class PaymentsService {
  private readonly baseUrl = 'https://api.yookassa.ru/v3';

  constructor(private readonly configService: ConfigService) {}

  private getAuthHeader(): string {
    const shopId = this.configService.get<string>('YOOKASSA_SHOP_ID');
    const secretKey = this.configService.get<string>('YOOKASSA_SECRET_KEY');

    if (!shopId || !secretKey) {
      throw new InternalServerErrorException(
        'YOOKASSA_SHOP_ID or YOOKASSA_SECRET_KEY is not configured',
      );
    }

    return `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString('base64')}`;
  }

  async createPayment(params: {
    orderId: string;
    amountKopecks: number;
    description: string;
    returnUrl: string;
  }): Promise<YookassaPayment> {
    const amountRubles = (params.amountKopecks / 100).toFixed(2);

    const response = await fetch(`${this.baseUrl}/payments`, {
      method: 'POST',
      headers: {
        Authorization: this.getAuthHeader(),
        'Idempotence-Key': randomUUID(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: {
          value: amountRubles,
          currency: 'RUB',
        },
        confirmation: {
          type: 'embedded',
        },
        description: params.description,
        metadata: {
          orderId: params.orderId,
        },
        capture: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new InternalServerErrorException(
        `YooKassa createPayment failed: ${error}`,
      );
    }

    return response.json() as Promise<YookassaPayment>;
  }

  async getPayment(paymentId: string): Promise<YookassaPayment> {
    const response = await fetch(`${this.baseUrl}/payments/${paymentId}`, {
      headers: {
        Authorization: this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new InternalServerErrorException(
        `YooKassa getPayment failed: ${error}`,
      );
    }

    return response.json() as Promise<YookassaPayment>;
  }

  parseWebhook(body: unknown): YookassaWebhookPayload {
    const payload = body as YookassaWebhookPayload;

    if (payload?.type !== 'notification' || !payload?.event || !payload?.object?.id) {
      throw new Error('Invalid webhook payload');
    }

    return payload;
  }
}
