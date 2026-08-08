import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  YookassaPayment,
  YookassaReceiptItem,
  YookassaWebhookPayload,
} from './types/yookassa.types';

@Injectable()
export class PaymentsService {
  private readonly baseUrl = 'https://api.yookassa.ru/v3';

  constructor(private readonly configService: ConfigService) {}

  private getRequestSignal() {
    return AbortSignal.timeout(
      this.configService.get<number>('YOOKASSA_REQUEST_TIMEOUT_MS') ?? 10000,
    );
  }

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
    amountRubles: number;
    description: string;
    returnUrl: string;
    customerEmail: string;
    receiptItems: YookassaReceiptItem[];
    idempotenceKey: string;
  }): Promise<YookassaPayment> {
    const amountRubles = params.amountRubles.toFixed(2);

    const response = await fetch(`${this.baseUrl}/payments`, {
      method: 'POST',
      signal: this.getRequestSignal(),
      headers: {
        Authorization: this.getAuthHeader(),
        'Idempotence-Key': params.idempotenceKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: {
          value: amountRubles,
          currency: 'RUB',
        },
        confirmation: {
          type: 'embedded',
          return_url: params.returnUrl,
        },
        description: params.description,
        metadata: {
          orderId: params.orderId,
        },
        receipt: {
          customer: {
            email: params.customerEmail,
          },
          items: params.receiptItems,
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
      signal: this.getRequestSignal(),
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

    if (
      payload?.type !== 'notification' ||
      !payload?.event ||
      !payload?.object?.id
    ) {
      throw new Error('Invalid webhook payload');
    }

    return payload;
  }
}
