import { ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { EmailDeliveryProvider } from '../email/email-delivery-provider.interface';
import { DeliveryQuoteEmailService } from './delivery-quote-email.service';

describe('DeliveryQuoteEmailService', () => {
  const quote = {
    id: 'quote-123',
    productId: 'product-456',
    destinationRegion: 'Московская область',
    destinationCity: 'Химки',
    destinationAddress: 'Ленинградская, 1',
    customerName: 'Иван Иванов',
    customerPhone: '+7 999 000-00-00',
    createdAt: new Date('2026-08-05T10:15:30.000Z'),
    product: { title: 'Большой шкаф' },
  };

  it('sends the notification to the configured manager address', async () => {
    const sendEmail = jest.fn().mockResolvedValue({
      provider: 'resend',
      externalMessageId: 'email-789',
    });
    const config = {
      get: jest.fn((key: string) =>
        key === 'MANAGER_EMAIL' ? 'manager@example.com' : 'resend',
      ),
    } as unknown as ConfigService;
    const provider = { sendEmail } as EmailDeliveryProvider;
    const service = new DeliveryQuoteEmailService(config, provider);

    await service.notifyManager(quote);

    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'manager@example.com',
        idempotencyKey: 'delivery-quote-quote-123',
        logContext: { deliveryRequestId: 'quote-123' },
      }),
    );
  });

  it('returns a service error when the manager address is not configured', async () => {
    const sendEmail = jest.fn();
    const config = {
      get: jest.fn().mockReturnValue(undefined),
    } as unknown as ConfigService;
    const provider = { sendEmail } as EmailDeliveryProvider;
    const service = new DeliveryQuoteEmailService(config, provider);

    await expect(service.notifyManager(quote)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('rejects a non-delivering provider instead of reporting success', async () => {
    const sendEmail = jest.fn();
    const config = {
      get: jest.fn((key: string) =>
        key === 'MANAGER_EMAIL' ? 'manager@example.com' : 'console',
      ),
    } as unknown as ConfigService;
    const service = new DeliveryQuoteEmailService(config, { sendEmail });

    await expect(service.notifyManager(quote)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('rejects a provider response without a confirmed message ID', async () => {
    const sendEmail = jest.fn().mockResolvedValue({ provider: 'resend' });
    const config = {
      get: jest.fn((key: string) =>
        key === 'MANAGER_EMAIL' ? 'manager@example.com' : 'resend',
      ),
    } as unknown as ConfigService;
    const service = new DeliveryQuoteEmailService(config, { sendEmail });

    await expect(service.notifyManager(quote)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
