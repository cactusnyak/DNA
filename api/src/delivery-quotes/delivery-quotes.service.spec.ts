import { ServiceUnavailableException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { DeliveryQuoteEmailService } from './delivery-quote-email.service';
import { DeliveryQuotesService } from './delivery-quotes.service';

describe('DeliveryQuotesService.create', () => {
  const body = {
    clientRequestId: 'request-123',
    productId: 'product-456',
    cartLineKey: 'product-456:[]',
    quantity: 1,
    destinationRegion: 'Московская область',
    destinationCity: 'Химки',
    destinationAddress: 'Ленинградская, 1',
    customerName: 'Иван Иванов',
    customerPhone: '+7 999 000-00-00',
  };
  const owner = { guestSessionId: 'guest-123' };
  const product = {
    id: 'product-456',
    title: 'Большой шкаф',
    isOversizedOverride: null,
    location: { name: 'Москва' },
    category: { isOversized: true },
  };
  const quote = {
    id: 'quote-123',
    clientRequestId: body.clientRequestId,
    productId: product.id,
    userId: null,
    guestSessionId: owner.guestSessionId,
    destinationRegion: body.destinationRegion,
    destinationCity: body.destinationCity,
    destinationAddress: body.destinationAddress,
    customerName: body.customerName,
    customerPhone: body.customerPhone,
    createdAt: new Date('2026-08-05T10:15:30.000Z'),
    managerNotifiedAt: null,
    managerEmailMessageId: null,
    status: 'PENDING' as const,
    product,
  };

  const build = (existing: typeof quote | null = null) => {
    const prisma = {
      product: { findFirst: jest.fn().mockResolvedValue(product) },
      oversizedDeliveryQuote: {
        findUnique: jest.fn().mockResolvedValue(existing),
        upsert: jest.fn().mockResolvedValue(quote),
        update: jest.fn().mockResolvedValue(undefined),
      },
    } as unknown as PrismaService;
    const notifyManager = jest.fn().mockResolvedValue({
      provider: 'resend',
      externalMessageId: 'email-789',
    });
    const email = { notifyManager } as unknown as DeliveryQuoteEmailService;
    return {
      service: new DeliveryQuotesService(prisma, email),
      prisma: prisma as unknown as {
        oversizedDeliveryQuote: {
          findUnique: jest.Mock;
          upsert: jest.Mock;
          update: jest.Mock;
        };
      },
      notifyManager,
    };
  };

  it('calls and awaits manager notification in the real create flow', async () => {
    let resolveSend!: (value: {
      provider: string;
      externalMessageId: string;
    }) => void;
    const pendingSend = new Promise<{
      provider: string;
      externalMessageId: string;
    }>((resolve) => {
      resolveSend = resolve;
    });
    const { service, notifyManager, prisma } = build();
    notifyManager.mockReturnValueOnce(pendingSend);

    const result = service.create(body, owner);
    await new Promise((resolve) => setImmediate(resolve));
    expect(notifyManager).toHaveBeenCalledWith(quote);
    expect(prisma.oversizedDeliveryQuote.update).not.toHaveBeenCalled();

    resolveSend({ provider: 'resend', externalMessageId: 'email-789' });
    await expect(result).resolves.toBe(quote);
    expect(prisma.oversizedDeliveryQuote.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: quote.id },
        // Jest's asymmetric matcher is intentionally dynamic.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: expect.objectContaining({ managerEmailMessageId: 'email-789' }),
      }),
    );
    expect(prisma.oversizedDeliveryQuote.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          cartLineKey: body.cartLineKey,
          quantity: body.quantity,
        }),
      }),
    );
  });

  it('cancels an active owned quote before its cart-line quantity changes', async () => {
    const { service, prisma } = build(quote);
    prisma.oversizedDeliveryQuote.update.mockResolvedValueOnce({
      ...quote,
      status: 'CANCELLED',
    });

    await expect(service.cancel(quote.id, owner)).resolves.toEqual(
      expect.objectContaining({ status: 'CANCELLED' }),
    );
    expect(prisma.oversizedDeliveryQuote.update).toHaveBeenCalledWith({
      where: { id: quote.id },
      data: { status: 'CANCELLED' },
      include: { product: true },
    });
  });

  it('propagates provider failure and retains the request for a safe retry', async () => {
    const { service, notifyManager, prisma } = build();
    notifyManager.mockRejectedValueOnce(
      new ServiceUnavailableException('Email delivery failed'),
    );

    await expect(service.create(body, owner)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    expect(prisma.oversizedDeliveryQuote.upsert).toHaveBeenCalledTimes(1);
    expect(prisma.oversizedDeliveryQuote.update).not.toHaveBeenCalled();

    prisma.oversizedDeliveryQuote.findUnique.mockResolvedValueOnce(quote);
    await expect(service.create(body, owner)).resolves.toBe(quote);
    expect(prisma.oversizedDeliveryQuote.upsert).toHaveBeenCalledTimes(1);
    expect(notifyManager).toHaveBeenCalledTimes(2);
  });

  it('does not recreate a request or resend after confirmed notification', async () => {
    const confirmed = {
      ...quote,
      managerNotifiedAt: new Date('2026-08-05T10:16:00.000Z'),
      managerEmailMessageId: 'email-789',
    };
    const { service, notifyManager, prisma } = build(confirmed);

    await expect(service.create(body, owner)).resolves.toBe(confirmed);
    expect(prisma.oversizedDeliveryQuote.upsert).not.toHaveBeenCalled();
    expect(notifyManager).not.toHaveBeenCalled();
  });
});
