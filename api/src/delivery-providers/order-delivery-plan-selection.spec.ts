/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call */
import { ConflictException, NotFoundException } from '@nestjs/common';

import { OrderDeliveryService } from './order-delivery.service';

describe('OrderDeliveryService.selectPlan', () => {
  const quote = {
    id: 'quote-1',
    orderId: 'order-1',
    groupKey: 'group-1',
    expiresAt: new Date('2026-08-20T13:00:00.000Z'),
    status: 'CREATED',
    destinationVersion: 1,
    orderDeliveryVersion: 1,
    deliveryProviderId: 'provider-1',
    fingerprint: 'fingerprint',
    customerCharge: 500,
    currency: 'RUB',
    deliveryProvider: { isActive: true },
    deliveryService: { isActive: true },
  };
  const selection = {
    groupKey: 'group-1',
    quoteId: 'quote-1',
  };
  const plan = { planId: 'plan-1', selections: [selection] };
  const baseOrder = {
    id: 'order-1',
    userId: 'user-1',
    guestSessionId: null,
    status: 'AWAITING_PAYMENT',
    pricingVersion: 2,
    deliveryVersion: 1,
    deliveryDestination: { version: 1 },
    paymentAttempts: [],
    deliverySelections: [],
    deliveryQuotes: [quote],
    items: [],
  };

  function setup(order = baseOrder) {
    const tx: any = {
      order: {
        findUnique: jest.fn().mockResolvedValue(order),
        update: jest.fn(),
      },
      deliveryQuote: {
        findMany: jest.fn().mockResolvedValue([quote]),
        updateMany: jest.fn(),
      },
      orderDeliverySelection: {
        deleteMany: jest.fn(),
        createMany: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
      },
      orderItem: { findMany: jest.fn().mockResolvedValue([]) },
    };
    const prisma: any = { $transaction: jest.fn((callback) => callback(tx)) };
    const resolver: any = {
      resolve: jest.fn().mockReturnValue({
        groups: [{ groupKey: 'group-1' }],
        unavailableItems: [],
      }),
    };
    const service = new OrderDeliveryService(
      prisma,
      resolver,
      {} as any,
      {} as any,
    );
    jest.spyOn(service, 'getState').mockResolvedValue({ ok: true } as any);
    jest.spyOn(service, 'buildFingerprint').mockReturnValue('fingerprint');
    jest.spyOn(service as any, 'buildPlans').mockReturnValue([plan]);
    return { service, tx };
  }

  beforeEach(() =>
    jest.useFakeTimers().setSystemTime(new Date('2026-08-20T12:00:00.000Z')),
  );
  afterEach(() => jest.useRealTimers());

  it('atomically replaces the complete bundle', async () => {
    const { service, tx } = setup();
    await service.selectPlan(
      'order-1',
      { planId: 'plan-1', pricingVersion: 2 },
      { userId: 'user-1' },
    );
    expect(tx.orderDeliverySelection.deleteMany).toHaveBeenCalledWith({
      where: { orderId: 'order-1' },
    });
    expect(tx.orderDeliverySelection.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [
          expect.objectContaining({
            groupKey: 'group-1',
            deliveryQuoteId: 'quote-1',
          }),
        ],
      }),
    );
  });

  it('rejects an unknown or stale plan id', async () => {
    const { service } = setup();
    await expect(
      service.selectPlan(
        'order-1',
        { planId: 'unknown' },
        { userId: 'user-1' },
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects a stale pricing version', async () => {
    const { service } = setup();
    await expect(
      service.selectPlan(
        'order-1',
        { planId: 'plan-1', pricingVersion: 1 },
        { userId: 'user-1' },
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('enforces user ownership', async () => {
    const { service } = setup();
    await expect(
      service.selectPlan('order-1', { planId: 'plan-1' }, { userId: 'other' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('supports guest ownership', async () => {
    const { service } = setup({
      ...baseOrder,
      userId: null,
      guestSessionId: 'guest-1',
    });
    await expect(
      service.selectPlan(
        'order-1',
        { planId: 'plan-1' },
        { guestSessionId: 'guest-1' },
      ),
    ).resolves.toEqual({ ok: true });
  });

  it('is idempotent for an already selected bundle', async () => {
    const { service, tx } = setup({
      ...baseOrder,
      deliverySelections: [{ deliveryQuoteId: 'quote-1' }],
    });
    await service.selectPlan(
      'order-1',
      { planId: 'plan-1' },
      { userId: 'user-1' },
    );
    expect(tx.orderDeliverySelection.deleteMany).not.toHaveBeenCalled();
    expect(tx.order.update).not.toHaveBeenCalled();
  });

  it('clears the selected bundle and recalculates pricing', async () => {
    const { service, tx } = setup({
      ...baseOrder,
      deliverySelections: [{ deliveryQuoteId: 'quote-1' }],
    });

    await service.selectPlan(
      'order-1',
      { planId: null, pricingVersion: 2 },
      { userId: 'user-1' },
    );

    expect(tx.orderDeliverySelection.deleteMany).toHaveBeenCalledWith({
      where: { orderId: 'order-1' },
    });
    expect(tx.deliveryQuote.updateMany).toHaveBeenCalledWith({
      where: { orderId: 'order-1', status: 'SELECTED' },
      data: { status: 'CREATED', selectedAt: null },
    });
    expect(tx.order.update).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      data: { pricingVersion: { increment: 1 } },
    });
  });

  it('is idempotent when clearing an empty selection', async () => {
    const { service, tx } = setup();

    await service.selectPlan('order-1', { planId: null }, { userId: 'user-1' });

    expect(tx.orderDeliverySelection.deleteMany).not.toHaveBeenCalled();
    expect(tx.deliveryQuote.updateMany).not.toHaveBeenCalled();
    expect(tx.order.update).not.toHaveBeenCalled();
  });
});
