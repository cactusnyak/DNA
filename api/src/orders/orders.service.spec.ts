import { ConflictException, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from './orders.service';

describe('OrdersService user order operations', () => {
  const orderId = 'order-1';
  let tx: any;
  let prisma: any;
  let service: OrdersService;

  beforeEach(() => {
    tx = {
      order: {
        findFirst: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        delete: jest.fn(),
      },
      orderItem: { deleteMany: jest.fn() },
    };
    prisma = {
      order: { findFirst: jest.fn() },
      $transaction: jest.fn((callback) => callback(tx)),
    };
    service = new OrdersService(prisma as PrismaService);
  });

  it.each([OrderStatus.CREATED, OrderStatus.AWAITING_PAYMENT])(
    'allows continuing an unpaid order in %s',
    (status) => {
      const mapped = (service as any).mapOrder({
        id: orderId,
        status,
        userId: 'user-1',
        customerName: 'Иван',
        customerPhone: '+79990000000',
        deliveryAddress: 'Москва',
        totalAmount: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
        paymentAttempts: [],
        items: [],
      });

      expect(mapped.capabilities.canContinue).toBe(true);
    },
  );

  it('does not reveal an order owned by another user', async () => {
    prisma.order.findFirst.mockResolvedValue(null);
    await expect(
      service.findOwnedById(orderId, 'other-user'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.order.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: orderId, userId: 'other-user' },
      }),
    );
  });

  it('cancels an unpaid submitted order without deleting history', async () => {
    tx.order.findFirst.mockResolvedValue({
      id: orderId,
      status: OrderStatus.AWAITING_PAYMENT,
      paymentAttempts: [],
      _count: { referralRewards: 0 },
    });
    await expect(service.removeOwnedOrder(orderId, 'user-1')).resolves.toEqual({
      action: 'cancelled',
    });
    expect(tx.order.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: orderId,
          userId: 'user-1',
          status: OrderStatus.AWAITING_PAYMENT,
        },
        data: { status: OrderStatus.CANCELLED },
      }),
    );
    expect(tx.order.delete).not.toHaveBeenCalled();
  });

  it.each([
    OrderStatus.PAID,
    OrderStatus.SHIPPED,
    OrderStatus.DELIVERED,
    OrderStatus.CANCELLED,
  ])('rejects removal in %s', async (status) => {
    tx.order.findFirst.mockResolvedValue({
      id: orderId,
      status,
      paymentAttempts: [],
      _count: { referralRewards: 0 },
    });
    await expect(
      service.removeOwnedOrder(orderId, 'user-1'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('deletes only an unreferenced CREATED draft', async () => {
    tx.order.findFirst.mockResolvedValue({
      id: orderId,
      status: OrderStatus.CREATED,
      paymentAttempts: [],
      _count: { referralRewards: 0 },
    });
    await expect(service.removeOwnedOrder(orderId, 'user-1')).resolves.toEqual({
      action: 'deleted',
    });
    expect(tx.orderItem.deleteMany).toHaveBeenCalledWith({
      where: { orderId },
    });
    expect(tx.order.delete).toHaveBeenCalledWith({ where: { id: orderId } });
  });

  it('rejects cancellation after payment has been initiated', async () => {
    tx.order.findFirst.mockResolvedValue({
      id: orderId,
      status: OrderStatus.AWAITING_PAYMENT,
      paymentAttempts: [{ status: 'PENDING' }],
      _count: { referralRewards: 0 },
    });
    await expect(
      service.removeOwnedOrder(orderId, 'user-1'),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(tx.order.updateMany).not.toHaveBeenCalled();
  });
});
