import { InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PaymentsService } from './payments.service';

describe('PaymentsService', () => {
  type PaymentRequestBody = {
    capture: boolean;
    confirmation: { type: string; return_url: string };
    receipt: {
      customer: { email: string };
      items: Array<{ vat_code: number }>;
    };
  };
  const config = {
    get: jest.fn((key: string) => {
      if (key === 'YOOKASSA_SHOP_ID') return '1430696';
      if (key === 'YOOKASSA_SECRET_KEY') return 'test-secret';
      return undefined;
    }),
  } as unknown as ConfigService;
  let service: PaymentsService;

  beforeEach(() => {
    service = new PaymentsService(config);
    jest.restoreAllMocks();
  });

  it('creates an embedded captured payment with receipt and stable idempotence key', async () => {
    const payment = {
      id: 'payment-id',
      status: 'pending',
      paid: false,
      test: true,
      amount: { value: '1500.00', currency: 'RUB' },
      confirmation: { type: 'embedded', confirmation_token: 'token' },
      metadata: { orderId: 'order-id' },
      created_at: '2026-08-08T10:00:00Z',
    };
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(
        new Response(JSON.stringify(payment), { status: 200 }),
      );

    await service.createPayment({
      orderId: 'order-id',
      amountRubles: 1500,
      description: 'Заказ №order-id',
      returnUrl:
        'https://stage.dna-platform.shop/checkout/result?orderId=order-id',
      customerEmail: 'buyer@example.com',
      idempotenceKey: 'stable-key',
      receiptItems: [
        {
          description: 'Товар',
          quantity: '1.000',
          amount: { value: '1500.00', currency: 'RUB' },
          vat_code: 1,
          payment_mode: 'full_payment',
          payment_subject: 'commodity',
        },
      ],
    });

    const [, init] = fetchMock.mock.calls[0];
    const headers = init?.headers as Record<string, string>;
    expect(typeof init?.body).toBe('string');
    const body = JSON.parse(init?.body as string) as PaymentRequestBody;
    expect(headers['Idempotence-Key']).toBe('stable-key');
    expect(body.capture).toBe(true);
    expect(body.confirmation).toEqual({
      type: 'embedded',
      return_url:
        'https://stage.dna-platform.shop/checkout/result?orderId=order-id',
    });
    expect(body.receipt.customer.email).toBe('buyer@example.com');
    expect(body.receipt.items[0].vat_code).toBe(1);
  });

  it('rejects malformed webhook payloads', () => {
    expect(() => service.parseWebhook({ event: 'payment.succeeded' })).toThrow(
      'Invalid webhook payload',
    );
  });

  it('requires credentials before an API request', async () => {
    const missingConfig = {
      get: jest.fn(),
    } as unknown as ConfigService;
    await expect(
      new PaymentsService(missingConfig).getPayment('payment-id'),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });
});
