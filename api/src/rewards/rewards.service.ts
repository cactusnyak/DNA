import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BalanceOperationType,
  BonusSpendingHoldStatus,
  OrderStatus,
  Prisma,
  RewardStatus,
  RewardType,
} from '@prisma/client';
import { randomUUID } from 'crypto';

import { PrismaService } from '../prisma/prisma.service';
import { calculateReward, REWARD_POLICY_VERSION } from './reward-calculation';
import {
  allocateWholeRubles,
  MAX_BONUS_PAYMENT_BASIS_POINTS,
} from './reward-calculation';

type Transaction = Prisma.TransactionClient;

@Injectable()
export class RewardsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPendingForPaidOrder(orderId: string, externalTx?: Transaction) {
    const run = (tx: Transaction) =>
      this.createPendingInTransaction(tx, orderId);
    return externalTx ? run(externalTx) : this.prisma.$transaction(run);
  }

  private async createPendingInTransaction(tx: Transaction, orderId: string) {
    await tx.$queryRaw`SELECT id FROM "Order" WHERE id = ${orderId} FOR UPDATE`;
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: { include: { rewardShares: true } } } },
        referralRewards: { select: { id: true } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== OrderStatus.PAID) return { created: 0 };
    if (!order.userId || order.referralRewards.length > 0)
      return { created: 0 };

    const levels = await tx.rewardProgramLevel.findMany({
      where: { isActive: true },
      orderBy: { depth: 'asc' },
    });
    const recipients = new Map<
      number,
      { userId: string; referralId?: string }
    >();
    recipients.set(0, { userId: order.userId });
    let invitedUserId = order.userId;
    for (const level of levels) {
      const edge = await tx.referral.findUnique({ where: { invitedUserId } });
      if (!edge) break;
      recipients.set(level.depth, {
        userId: edge.inviterUserId,
        referralId: edge.id,
      });
      invitedUserId = edge.inviterUserId;
    }

    const rewards: Array<{
      id: string;
      recipientUserId: string;
      referralId?: string;
      orderItemId: string;
      type: RewardType;
      levelDepth: number;
      amount: number;
      snapshot: Prisma.InputJsonValue;
    }> = [];

    for (const item of order.items) {
      const shares = item.product.rewardShares
        .filter(
          (share) =>
            share.depth === 0 ||
            levels.some((level) => level.id === share.levelId),
        )
        .map((share) => ({
          depth: share.depth,
          shareBasisPoints: share.shareBasisPoints,
        }));
      const eligibleRevenue = Math.max(
        0,
        item.unitPrice * item.quantity - item.bonusAllocation,
      );
      const costBasis =
        item.product.purchasePrice == null
          ? null
          : item.product.purchasePrice * item.quantity;
      const calculation = calculateReward({
        eligibleRevenue,
        costBasis,
        rewardEnabled: item.product.rewardEnabled,
        shares,
      });
      const levelSnapshot = levels.map(
        ({ id, depth, name, configVersion }) => ({
          id,
          depth,
          name,
          configVersion,
        }),
      );

      await tx.orderItem.update({
        where: { id: item.id },
        data: {
          rewardCostSnapshot: costBasis,
          rewardPolicySnapshot: {
            policyVersion: REWARD_POLICY_VERSION,
            moneyUnit: 'WHOLE_RUB',
            eligibleRevenue,
            distribution: shares,
            levels: levelSnapshot,
          },
        },
      });

      for (const distribution of calculation.distributions) {
        const recipient = recipients.get(distribution.depth);
        if (!recipient || distribution.amount <= 0) continue;
        rewards.push({
          id: randomUUID(),
          recipientUserId: recipient.userId,
          referralId: recipient.referralId,
          orderItemId: item.id,
          type:
            distribution.depth === 0
              ? RewardType.BUYER_CASHBACK
              : RewardType.REFERRAL,
          levelDepth: distribution.depth,
          amount: distribution.amount,
          snapshot: {
            policyVersion: REWARD_POLICY_VERSION,
            moneyUnit: 'WHOLE_RUB',
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            bonusAllocation: item.bonusAllocation,
            costBasis,
            calculation,
            levels: levelSnapshot,
            recipientUserId: recipient.userId,
          },
        });
      }
    }

    for (const reward of rewards) {
      await tx.referralReward.create({
        data: {
          id: reward.id,
          orderId,
          orderItemId: reward.orderItemId,
          recipientUserId: reward.recipientUserId,
          referralId: reward.referralId,
          type: reward.type,
          levelDepth: reward.levelDepth,
          amount: reward.amount,
          status: RewardStatus.PENDING,
          policyVersion: REWARD_POLICY_VERSION,
          calculationSnapshot: reward.snapshot,
        },
      });
      await tx.balance.update({
        where: { userId: reward.recipientUserId },
        data: { pendingRewardValue: { increment: reward.amount } },
      });
      await tx.balanceOperation.create({
        data: {
          userId: reward.recipientUserId,
          orderId,
          rewardId: reward.id,
          type: BalanceOperationType.REWARD_PENDING,
          amount: reward.amount,
          pendingDelta: reward.amount,
          idempotencyKey: `reward:${reward.id}:pending`,
        },
      });
    }
    return { created: rewards.length };
  }

  async releaseOrderRewards(orderId: string, markDelivered = false) {
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Order" WHERE id = ${orderId} FOR UPDATE`;
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { shipments: { select: { status: true } } },
      });
      if (!order) throw new NotFoundException('Order not found');
      const activeShipments = order.shipments.filter(
        (shipment) => shipment.status !== 'CANCELLED',
      );
      if (
        activeShipments.length > 0 &&
        activeShipments.some((shipment) => shipment.status !== 'DELIVERED')
      ) {
        throw new BadRequestException('All active shipments must be delivered');
      }
      if (
        markDelivered &&
        (order.status === OrderStatus.PAID ||
          order.status === OrderStatus.SHIPPED)
      ) {
        await tx.order.update({
          where: { id: orderId },
          data: { status: OrderStatus.DELIVERED },
        });
      } else if (
        order.status !== OrderStatus.DELIVERED &&
        order.status !== OrderStatus.CASHBACK_ACCRUED
      ) {
        throw new BadRequestException(
          'Order must be delivered before reward release',
        );
      }
      const rewards = await tx.referralReward.findMany({
        where: {
          orderId,
          status: RewardStatus.PENDING,
          recipientUserId: { not: null },
        },
      });
      for (const reward of rewards) {
        const balance = await tx.balance.findUniqueOrThrow({
          where: { userId: reward.recipientUserId! },
        });
        const debtRepaid = Math.min(balance.debtValue, reward.amount);
        const available = reward.amount - debtRepaid;
        await tx.balance.update({
          where: { userId: reward.recipientUserId! },
          data: {
            pendingRewardValue: { decrement: reward.amount },
            debtValue: { decrement: debtRepaid },
            value: { increment: available },
          },
        });
        await tx.referralReward.update({
          where: { id: reward.id },
          data: { status: RewardStatus.AVAILABLE, availableAt: new Date() },
        });
        await tx.balanceOperation.create({
          data: {
            userId: reward.recipientUserId!,
            orderId,
            rewardId: reward.id,
            type: BalanceOperationType.REWARD_RELEASE,
            amount: reward.amount,
            pendingDelta: -reward.amount,
            activeDelta: available,
            debtDelta: -debtRepaid,
            idempotencyKey: `reward:${reward.id}:release`,
          },
        });
      }
      if (rewards.length > 0) {
        await tx.order.update({
          where: { id: orderId },
          data: { status: OrderStatus.CASHBACK_ACCRUED },
        });
      }
      return { released: rewards.length };
    });
  }

  async cancelPendingRewards(
    orderId: string,
    reason: string,
    actorUserId?: string,
  ) {
    if (!reason.trim()) throw new BadRequestException('Reason is required');
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Order" WHERE id = ${orderId} FOR UPDATE`;
      const rewards = await tx.referralReward.findMany({
        where: {
          orderId,
          status: RewardStatus.PENDING,
          recipientUserId: { not: null },
        },
      });
      for (const reward of rewards) {
        await tx.balance.update({
          where: { userId: reward.recipientUserId! },
          data: { pendingRewardValue: { decrement: reward.amount } },
        });
        await tx.referralReward.update({
          where: { id: reward.id },
          data: { status: RewardStatus.CANCELLED, cancelledAt: new Date() },
        });
        await tx.balanceOperation.create({
          data: {
            userId: reward.recipientUserId!,
            orderId,
            rewardId: reward.id,
            type: BalanceOperationType.REWARD_CANCEL,
            amount: reward.amount,
            pendingDelta: -reward.amount,
            idempotencyKey: `reward:${reward.id}:cancel`,
            reason,
            actorUserId,
          },
        });
      }
      return { cancelled: rewards.length };
    });
  }

  async reverseOrderRewards(
    orderId: string,
    reason: string,
    actorUserId?: string,
    returnedItems?: Array<{ orderItemId: string; quantity: number }>,
  ) {
    if (!reason.trim()) throw new BadRequestException('Reason is required');
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Order" WHERE id = ${orderId} FOR UPDATE`;
      const rewards = await tx.referralReward.findMany({
        where: {
          orderId,
          status: {
            in: [RewardStatus.AVAILABLE, RewardStatus.PARTIALLY_REVERSED],
          },
          recipientUserId: { not: null },
        },
      });
      for (const reward of rewards) {
        const requestedReturn = returnedItems?.find(
          (item) => item.orderItemId === reward.orderItemId,
        );
        if (returnedItems && !requestedReturn) continue;
        const snapshot =
          reward.calculationSnapshot &&
          typeof reward.calculationSnapshot === 'object' &&
          !Array.isArray(reward.calculationSnapshot)
            ? (reward.calculationSnapshot as Record<string, unknown>)
            : {};
        const originalQuantity = Math.max(1, Number(snapshot.quantity ?? 1));
        const targetReversal = requestedReturn
          ? Math.min(
              reward.amount,
              Math.floor(
                (reward.amount *
                  Math.max(0, Math.trunc(requestedReturn.quantity))) /
                  originalQuantity,
              ),
            )
          : reward.amount;
        const reversal = targetReversal - reward.reversedAmount;
        if (reversal <= 0) continue;
        const balance = await tx.balance.findUniqueOrThrow({
          where: { userId: reward.recipientUserId! },
        });
        const activeDebit = Math.min(balance.value, reversal);
        const debt = reversal - activeDebit;
        await tx.balance.update({
          where: { userId: reward.recipientUserId! },
          data: {
            value: { decrement: activeDebit },
            debtValue: { increment: debt },
          },
        });
        await tx.referralReward.update({
          where: { id: reward.id },
          data: {
            reversedAmount: targetReversal,
            status:
              targetReversal >= reward.amount
                ? RewardStatus.REVERSED
                : RewardStatus.PARTIALLY_REVERSED,
            reversedAt:
              targetReversal >= reward.amount ? new Date() : undefined,
          },
        });
        await tx.balanceOperation.create({
          data: {
            userId: reward.recipientUserId!,
            orderId,
            rewardId: reward.id,
            type: BalanceOperationType.REWARD_REVERSE,
            amount: reversal,
            activeDelta: -activeDebit,
            debtDelta: debt,
            idempotencyKey: `reward:${reward.id}:reverse:${targetReversal}`,
            reason,
            actorUserId,
          },
        });
      }
      return { reversed: rewards.length };
    });
  }

  async getBalance(userId: string) {
    await this.releaseExpiredSpendingHoldsForUser(userId);
    return this.prisma.balance.findUniqueOrThrow({ where: { userId } });
  }

  async getHistory(userId: string, page = 1, pageSize = 25) {
    const take = Math.min(100, Math.max(1, pageSize));
    const skip = (Math.max(1, page) - 1) * take;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.balanceOperation.findMany({
        where: { userId },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip,
        take,
      }),
      this.prisma.balanceOperation.count({ where: { userId } }),
    ]);
    return { items, page: Math.max(1, page), pageSize: take, total };
  }

  getOrderRewards(orderId: string, userId: string) {
    return this.prisma.referralReward.findMany({
      where: { orderId, recipientUserId: userId },
      select: {
        id: true,
        orderId: true,
        orderItemId: true,
        type: true,
        levelDepth: true,
        amount: true,
        reversedAmount: true,
        status: true,
        createdAt: true,
        availableAt: true,
      },
      orderBy: [{ levelDepth: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async getConfiguration() {
    const levels = await this.prisma.rewardProgramLevel.findMany({
      where: { isActive: true },
      orderBy: { depth: 'asc' },
    });
    return {
      version: Math.max(1, ...levels.map((level) => level.configVersion)),
      moneyUnit: 'WHOLE_RUB',
      maxBonusPaymentPercent: 30,
      levels,
    };
  }

  async adminSearch(page = 1, pageSize = 25) {
    const take = Math.min(100, Math.max(1, pageSize));
    const skip = (Math.max(1, page) - 1) * take;
    const [rewards, rewardTotal, operations, operationTotal] =
      await this.prisma.$transaction([
        this.prisma.referralReward.findMany({
          include: {
            recipient: {
              select: { id: true, nickname: true, nicknameSuffix: true },
            },
            orderItem: { select: { id: true, productTitle: true } },
          },
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          skip,
          take,
        }),
        this.prisma.referralReward.count(),
        this.prisma.balanceOperation.findMany({
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          skip,
          take,
        }),
        this.prisma.balanceOperation.count(),
      ]);
    return {
      rewards,
      rewardTotal,
      operations,
      operationTotal,
      page: Math.max(1, page),
      pageSize: take,
    };
  }

  async applyBonus(orderId: string, userId: string, requestedAmount: number) {
    if (!Number.isSafeInteger(requestedAmount) || requestedAmount < 0) {
      throw new BadRequestException(
        'Bonus amount must be a non-negative whole-ruble integer',
      );
    }
    await this.releaseExpiredSpendingHoldsForUser(userId);
    return this.prisma.$transaction(
      async (tx) => {
        await tx.$queryRaw`SELECT id FROM "Balance" WHERE "userId" = ${userId} FOR UPDATE`;
        await tx.$queryRaw`SELECT id FROM "Order" WHERE id = ${orderId} FOR UPDATE`;
        const order = await tx.order.findFirst({
          where: { id: orderId, userId },
          include: {
            items: true,
            paymentAttempts: true,
            bonusSpendingHold: true,
          },
        });
        if (!order) throw new NotFoundException('Order not found');
        if (order.status !== OrderStatus.AWAITING_PAYMENT)
          throw new BadRequestException('Only unpaid orders can use bonuses');
        if (
          order.paymentAttempts.some(
            (attempt) => attempt.activeOrderId === order.id,
          )
        ) {
          throw new BadRequestException('Payment has already been initiated');
        }
        const balance = await tx.balance.findUniqueOrThrow({
          where: { userId },
        });
        if (balance.debtValue > 0)
          throw new BadRequestException(
            'Bonus spending is blocked while debt is positive',
          );
        const existingAmount =
          order.bonusSpendingHold?.status === BonusSpendingHoldStatus.ACTIVE
            ? order.bonusSpendingHold.amount
            : 0;
        const available = Math.max(
          0,
          balance.value - balance.spendingHoldValue + existingAmount,
        );
        const merchandiseSubtotal = order.items.reduce(
          (sum, item) => sum + item.unitPrice * item.quantity,
          0,
        );
        const maximum = Math.floor(
          (merchandiseSubtotal * MAX_BONUS_PAYMENT_BASIS_POINTS) / 10_000,
        );
        const applied = Math.min(requestedAmount, available, maximum);
        const allocations = allocateWholeRubles(
          applied,
          order.items.map((item) => ({
            id: item.id,
            eligibleAmount: item.unitPrice * item.quantity,
          })),
        );
        const delta = applied - existingAmount;
        for (const allocation of allocations) {
          await tx.orderItem.update({
            where: { id: allocation.id },
            data: { bonusAllocation: allocation.amount },
          });
        }
        const nextVersion = order.pricingVersion + 1;
        await tx.order.update({
          where: { id: orderId },
          data: {
            bonusDiscount: applied,
            externalPaymentAmount: order.totalAmount - applied,
            pricingVersion: nextVersion,
          },
        });
        const hold = await tx.bonusSpendingHold.upsert({
          where: { orderId },
          create: {
            orderId,
            userId,
            amount: applied,
            pricingVersion: nextVersion,
            status:
              applied > 0
                ? BonusSpendingHoldStatus.ACTIVE
                : BonusSpendingHoldStatus.RELEASED,
            expiresAt: new Date(Date.now() + 30 * 60 * 1000),
            releasedAt: applied > 0 ? null : new Date(),
          },
          update: {
            amount: applied,
            pricingVersion: nextVersion,
            status:
              applied > 0
                ? BonusSpendingHoldStatus.ACTIVE
                : BonusSpendingHoldStatus.RELEASED,
            expiresAt: new Date(Date.now() + 30 * 60 * 1000),
            releasedAt: applied > 0 ? null : new Date(),
            settledAt: null,
          },
        });
        if (delta !== 0) {
          await tx.balance.update({
            where: { userId },
            data: { spendingHoldValue: { increment: delta } },
          });
          await tx.balanceOperation.create({
            data: {
              userId,
              orderId,
              holdId: hold.id,
              type:
                delta > 0
                  ? BalanceOperationType.BONUS_HOLD
                  : BalanceOperationType.BONUS_HOLD_RELEASE,
              amount: Math.abs(delta),
              holdDelta: delta,
              idempotencyKey: `hold:${hold.id}:version:${nextVersion}`,
            },
          });
        }
        return {
          requestedAmount,
          appliedAmount: applied,
          maximumAmount: maximum,
          availableBalance: available,
          merchandiseSubtotal,
          deliveryAmount: order.totalAmount - merchandiseSubtotal,
          externalPaymentAmount: order.totalAmount - applied,
          pricingVersion: nextVersion,
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  removeBonus(orderId: string, userId: string) {
    return this.applyBonus(orderId, userId, 0);
  }

  async settleSpendingHold(tx: Transaction, orderId: string) {
    const hold = await tx.bonusSpendingHold.findUnique({ where: { orderId } });
    if (
      !hold ||
      hold.status !== BonusSpendingHoldStatus.ACTIVE ||
      hold.amount <= 0
    )
      return;
    const updated = await tx.bonusSpendingHold.updateMany({
      where: { id: hold.id, status: BonusSpendingHoldStatus.ACTIVE },
      data: { status: BonusSpendingHoldStatus.SETTLED, settledAt: new Date() },
    });
    if (!updated.count) return;
    await tx.balance.update({
      where: { userId: hold.userId },
      data: {
        value: { decrement: hold.amount },
        spendingHoldValue: { decrement: hold.amount },
      },
    });
    await tx.balanceOperation.create({
      data: {
        userId: hold.userId,
        orderId,
        holdId: hold.id,
        type: BalanceOperationType.BONUS_SPEND,
        amount: hold.amount,
        activeDelta: -hold.amount,
        holdDelta: -hold.amount,
        idempotencyKey: `hold:${hold.id}:settle`,
      },
    });
  }

  async releaseSpendingHold(tx: Transaction, orderId: string, reason: string) {
    const hold = await tx.bonusSpendingHold.findUnique({ where: { orderId } });
    if (!hold || hold.status !== BonusSpendingHoldStatus.ACTIVE) return;
    const updated = await tx.bonusSpendingHold.updateMany({
      where: { id: hold.id, status: BonusSpendingHoldStatus.ACTIVE },
      data: {
        status: BonusSpendingHoldStatus.RELEASED,
        releasedAt: new Date(),
      },
    });
    if (!updated.count) return;
    await tx.balance.update({
      where: { userId: hold.userId },
      data: { spendingHoldValue: { decrement: hold.amount } },
    });
    const order = await tx.order.findUniqueOrThrow({
      where: { id: orderId },
      select: { totalAmount: true },
    });
    await tx.orderItem.updateMany({
      where: { orderId },
      data: { bonusAllocation: 0 },
    });
    await tx.order.update({
      where: { id: orderId },
      data: {
        bonusDiscount: 0,
        externalPaymentAmount: order.totalAmount,
        pricingVersion: { increment: 1 },
      },
    });
    await tx.balanceOperation.create({
      data: {
        userId: hold.userId,
        orderId,
        holdId: hold.id,
        type: BalanceOperationType.BONUS_HOLD_RELEASE,
        amount: hold.amount,
        holdDelta: -hold.amount,
        idempotencyKey: `hold:${hold.id}:release`,
        reason,
      },
    });
  }

  async releaseExpiredSpendingHold(orderId: string) {
    return this.prisma.$transaction(async (tx) => {
      const hold = await tx.bonusSpendingHold.findUnique({
        where: { orderId },
      });
      if (
        hold?.status === BonusSpendingHoldStatus.ACTIVE &&
        hold.expiresAt <= new Date()
      ) {
        await this.releaseSpendingHold(tx, orderId, 'Checkout hold expired');
        return true;
      }
      return false;
    });
  }

  private async releaseExpiredSpendingHoldsForUser(userId: string) {
    const expiredHolds = await this.prisma.bonusSpendingHold.findMany({
      where: {
        userId,
        status: BonusSpendingHoldStatus.ACTIVE,
        expiresAt: { lte: new Date() },
      },
      select: { orderId: true },
    });
    for (const hold of expiredHolds) {
      await this.releaseExpiredSpendingHold(hold.orderId);
    }
  }
}
