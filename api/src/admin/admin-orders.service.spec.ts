import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrderStatus, UserRole } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { AdminOrdersService } from './admin-orders.service';

type TransactionClient = {
  referralReward: { deleteMany: jest.Mock };
  orderItem: { deleteMany: jest.Mock };
  order: { delete: jest.Mock };
  auditEvent: { create: jest.Mock };
};

describe('AdminOrdersService.hardDeleteOrder', () => {
  const orderId = 'order-1';
  const existingOrder = {
    id: orderId,
    status: OrderStatus.CREATED,
    totalAmount: 1000,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  let transactionClient: TransactionClient;
  let prismaService: {
    order: { findUnique: jest.Mock };
    orderItem: { count: jest.Mock };
    $transaction: jest.Mock;
  };
  let configValues: Record<string, unknown>;
  let service: AdminOrdersService;

  beforeEach(() => {
    transactionClient = {
      referralReward: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
      orderItem: { deleteMany: jest.fn().mockResolvedValue({ count: 1 }) },
      order: { delete: jest.fn().mockResolvedValue(existingOrder) },
      auditEvent: { create: jest.fn().mockResolvedValue({ id: 'audit-1' }) },
    };

    prismaService = {
      order: { findUnique: jest.fn().mockResolvedValue(existingOrder) },
      orderItem: { count: jest.fn().mockResolvedValue(1) },
      $transaction: jest.fn(
        async (callback: (tx: TransactionClient) => Promise<unknown>) =>
          callback(transactionClient),
      ),
    };

    configValues = {
      NODE_ENV: 'development',
      HARD_DELETE_ORDERS_ENABLED: false,
    };

    const configService = {
      get: (key: string) => configValues[key],
    };

    service = new AdminOrdersService(
      prismaService as unknown as PrismaService,
      configService as unknown as ConfigService,
    );
  });

  it('forbids a regular ADMIN from hard deleting', async () => {
    await expect(
      service.hardDeleteOrder(orderId, {
        actorUserId: 'user-admin',
        actorRole: UserRole.ADMIN,
        reason: 'created by mistake',
        confirmation: `DELETE ORDER ${orderId}`,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(prismaService.$transaction).not.toHaveBeenCalled();
  });

  it('rejects an incorrect confirmation phrase', async () => {
    await expect(
      service.hardDeleteOrder(orderId, {
        actorUserId: 'user-owner',
        actorRole: UserRole.OWNER,
        reason: 'created by mistake',
        confirmation: 'DELETE ORDER wrong',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prismaService.$transaction).not.toHaveBeenCalled();
  });

  it('forbids hard delete in production when the feature flag is off', async () => {
    configValues.NODE_ENV = 'production';
    configValues.HARD_DELETE_ORDERS_ENABLED = false;

    await expect(
      service.hardDeleteOrder(orderId, {
        actorUserId: 'user-owner',
        actorRole: UserRole.OWNER,
        reason: 'created by mistake',
        confirmation: `DELETE ORDER ${orderId}`,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('permanently deletes and writes an audit event for OWNER', async () => {
    let capturedAudit: { action?: string; targetId?: string } = {};
    transactionClient.auditEvent.create = jest.fn(
      (args: { data: { action: string; targetId: string } }) => {
        capturedAudit = args.data;
        return Promise.resolve({ id: 'audit-1' });
      },
    );

    const result = await service.hardDeleteOrder(orderId, {
      actorUserId: 'user-owner',
      actorRole: UserRole.OWNER,
      reason: 'created by mistake',
      confirmation: `DELETE ORDER ${orderId}`,
      requestId: 'req-1',
    });

    expect(result).toEqual({ id: orderId, deleted: true });
    expect(transactionClient.order.delete).toHaveBeenCalledWith({
      where: { id: orderId },
    });
    expect(transactionClient.auditEvent.create).toHaveBeenCalledTimes(1);
    expect(capturedAudit.action).toBe('ORDER_HARD_DELETE');
    expect(capturedAudit.targetId).toBe(orderId);
  });

  it('allows hard delete in production when the feature flag is on', async () => {
    configValues.NODE_ENV = 'production';
    configValues.HARD_DELETE_ORDERS_ENABLED = true;

    const result = await service.hardDeleteOrder(orderId, {
      actorUserId: 'user-ultra',
      actorRole: UserRole.ULTRA_ADMIN,
      reason: 'created by mistake',
      confirmation: `DELETE ORDER ${orderId}`,
    });

    expect(result).toEqual({ id: orderId, deleted: true });
  });
});
