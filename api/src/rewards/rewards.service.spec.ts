import { OrderStatus, RewardStatus } from '@prisma/client';
import { RewardsService } from './rewards.service';

function transactionClient() {
  const tx: any = {
    $queryRaw: jest.fn(),
    order: { findUnique: jest.fn(), update: jest.fn() },
    orderItem: { update: jest.fn() },
    rewardProgramLevel: { findMany: jest.fn().mockResolvedValue([]) },
    referral: { findUnique: jest.fn() },
    referralReward: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    balance: {
      update: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    },
    balanceOperation: { create: jest.fn() },
  };
  return tx;
}

function serviceWith(tx: any) {
  const prisma: any = {
    $transaction: jest.fn((callback: (client: any) => unknown) => callback(tx)),
  };
  return new RewardsService(prisma);
}

describe('RewardsService lifecycle', () => {
  it('creates an L0 pending reward and reserved counter once for a paid buyer', async () => {
    const tx = transactionClient();
    tx.order.findUnique.mockResolvedValue({
      id: 'order-1',
      status: OrderStatus.PAID,
      userId: 'buyer-1',
      referralRewards: [],
      items: [
        {
          id: 'item-1',
          productId: 'product-1',
          quantity: 1,
          unitPrice: 100_000,
          bonusAllocation: 0,
          product: {
            purchasePrice: 90_000,
            rewardEnabled: true,
            rewardShares: [{ depth: 0, levelId: null, shareBasisPoints: 1000 }],
          },
        },
      ],
    });
    const result = await serviceWith(tx).createPendingForPaidOrder('order-1');

    expect(result).toEqual({ created: 1 });
    expect(tx.referralReward.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          recipientUserId: 'buyer-1',
          amount: 150,
          status: RewardStatus.PENDING,
        }),
      }),
    );
    expect(tx.balance.update).toHaveBeenCalledWith({
      where: { userId: 'buyer-1' },
      data: { pendingRewardValue: { increment: 150 } },
    });
  });

  it('creates no rewards for a guest order', async () => {
    const tx = transactionClient();
    tx.order.findUnique.mockResolvedValue({
      id: 'order-guest',
      status: OrderStatus.PAID,
      userId: null,
      referralRewards: [],
      items: [],
    });
    await expect(
      serviceWith(tx).createPendingForPaidOrder('order-guest'),
    ).resolves.toEqual({ created: 0 });
    expect(tx.referralReward.create).not.toHaveBeenCalled();
  });

  it('releases pending rewards once and repays debt first', async () => {
    const tx = transactionClient();
    tx.order.findUnique.mockResolvedValue({
      id: 'order-1',
      status: OrderStatus.DELIVERED,
      shipments: [{ status: 'DELIVERED' }],
    });
    tx.referralReward.findMany.mockResolvedValue([
      { id: 'reward-1', recipientUserId: 'buyer-1', amount: 150 },
    ]);
    tx.balance.findUniqueOrThrow.mockResolvedValue({ debtValue: 50 });

    await expect(
      serviceWith(tx).releaseOrderRewards('order-1'),
    ).resolves.toEqual({
      released: 1,
    });
    expect(tx.balance.update).toHaveBeenCalledWith({
      where: { userId: 'buyer-1' },
      data: {
        pendingRewardValue: { decrement: 150 },
        debtValue: { decrement: 50 },
        value: { increment: 100 },
      },
    });
  });
});
