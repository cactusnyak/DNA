import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrderStatus, Prisma, UserRole } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { RewardsService } from '../rewards/rewards.service';

import {
  ListOrdersQueryDto,
  OrdersArchivedFilter,
} from './dto/list-orders-query.dto';

const ORDER_HARD_DELETE_ROLES: UserRole[] = [
  UserRole.OWNER,
  UserRole.ULTRA_ADMIN,
];

type HardDeleteOrderContext = {
  actorUserId?: string;
  actorRole?: UserRole;
  reason: string;
  confirmation: string;
  requestId?: string;
};

@Injectable()
export class AdminOrdersService {
  private readonly logger = new Logger(AdminOrdersService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly rewardsService?: RewardsService,
  ) {}

  async listOrders(query: ListOrdersQueryDto) {
    const { archived, page, pageSize } = query;

    const where: Prisma.OrderWhereInput = {};

    if (archived === OrdersArchivedFilter.FALSE) {
      where.archivedAt = null;
    } else if (archived === OrdersArchivedFilter.TRUE) {
      where.archivedAt = { not: null };
    }

    const [totalItems, items] = await this.prismaService.$transaction([
      this.prismaService.order.count({ where }),
      this.prismaService.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: { id: true, title: true, slug: true },
              },
            },
          },
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      items,
      pageInfo: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
      },
    };
  }

  async updateOrderStatus(id: string, body: unknown) {
    const payload = this.getObjectBody(body);

    if (
      typeof payload.status !== 'string' ||
      !Object.values(OrderStatus).includes(payload.status as OrderStatus)
    ) {
      throw new BadRequestException('Invalid order status');
    }

    const order = await this.getOrderOrThrow(id);
    const nextStatus = payload.status as OrderStatus;
    if (nextStatus === OrderStatus.CASHBACK_ACCRUED) {
      throw new BadRequestException(
        'CASHBACK_ACCRUED is set automatically after reward release',
      );
    }
    const allowed: Partial<Record<OrderStatus, OrderStatus[]>> = {
      [OrderStatus.CREATED]: [
        OrderStatus.AWAITING_PAYMENT,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.AWAITING_PAYMENT]: [OrderStatus.CANCELLED],
      [OrderStatus.PAID]: [
        OrderStatus.SHIPPED,
        OrderStatus.DELIVERED,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
      [OrderStatus.DELIVERED]: [OrderStatus.CANCELLED],
      [OrderStatus.CASHBACK_ACCRUED]: [OrderStatus.CANCELLED],
    };
    if (
      nextStatus !== order.status &&
      !allowed[order.status]?.includes(nextStatus)
    ) {
      throw new BadRequestException(
        `Invalid order transition ${order.status} -> ${nextStatus}`,
      );
    }
    if (nextStatus === OrderStatus.DELIVERED) {
      await this.rewardsService?.releaseOrderRewards(id, true);
      return this.getOrderOrThrow(id);
    }
    const updated = await this.prismaService.order.update({
      where: {
        id,
      },
      data: {
        status: nextStatus,
      },
    });
    if (nextStatus === OrderStatus.CANCELLED) {
      if (
        order.status === OrderStatus.DELIVERED ||
        order.status === OrderStatus.CASHBACK_ACCRUED
      ) {
        await this.rewardsService?.reverseOrderRewards(
          id,
          'Order cancelled after delivery',
        );
      } else {
        await this.rewardsService?.cancelPendingRewards(
          id,
          'Order cancelled by administrator',
        );
      }
    }
    return updated;
  }

  async archiveOrder(id: string, actorUserId?: string) {
    await this.getOrderOrThrow(id);

    return this.prismaService.order.update({
      where: { id },
      data: {
        archivedAt: new Date(),
        archivedByUserId: actorUserId ?? null,
      },
    });
  }

  async restoreOrder(id: string) {
    await this.getOrderOrThrow(id);

    return this.prismaService.order.update({
      where: { id },
      data: {
        archivedAt: null,
        archivedByUserId: null,
      },
    });
  }

  async hardDeleteOrder(id: string, context: HardDeleteOrderContext) {
    if (
      !context.actorRole ||
      !ORDER_HARD_DELETE_ROLES.includes(context.actorRole)
    ) {
      throw new ForbiddenException(
        'Only OWNER or ULTRA_ADMIN can permanently delete orders',
      );
    }

    if (this.isProduction() && !this.isHardDeleteEnabled()) {
      throw new ForbiddenException(
        'Permanent order deletion is disabled (HARD_DELETE_ORDERS_ENABLED is not true)',
      );
    }

    const expectedConfirmation = `DELETE ORDER ${id}`;
    if (context.confirmation !== expectedConfirmation) {
      throw new BadRequestException(
        `Confirmation phrase must be exactly "${expectedConfirmation}"`,
      );
    }

    const order = await this.getOrderOrThrow(id);
    const itemsCount = await this.prismaService.orderItem.count({
      where: { orderId: id },
    });
    const [financialHistoryCount, rewardHistoryCount] = await Promise.all([
      this.prismaService.balanceOperation?.count?.({
        where: { orderId: id },
      }) ?? Promise.resolve(0),
      this.prismaService.referralReward?.count?.({ where: { orderId: id } }) ??
        Promise.resolve(0),
    ]);
    if (financialHistoryCount > 0 || rewardHistoryCount > 0) {
      throw new ConflictException(
        'Order with reward or balance history cannot be permanently deleted',
      );
    }

    try {
      await this.prismaService.$transaction(async (transaction) => {
        await transaction.orderItem.deleteMany({
          where: { orderId: id },
        });

        await transaction.order.delete({
          where: { id },
        });

        await transaction.auditEvent.create({
          data: {
            action: 'ORDER_HARD_DELETE',
            actorUserId: context.actorUserId ?? null,
            actorRole: context.actorRole ?? null,
            targetType: 'Order',
            targetId: id,
            reason: context.reason,
            requestId: context.requestId ?? null,
            metadata: {
              status: order.status,
              totalAmount: order.totalAmount,
              itemsCount,
              createdAt: order.createdAt.toISOString(),
            },
          },
        });
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException(
          'Order cannot be permanently deleted because of existing dependencies',
        );
      }

      throw error;
    }

    this.logger.warn(
      `Order ${id} permanently deleted by ${context.actorRole} ${context.actorUserId ?? 'unknown'}`,
    );

    return { id, deleted: true };
  }

  private isProduction() {
    return this.configService.get<string>('NODE_ENV') === 'production';
  }

  private isHardDeleteEnabled() {
    return (
      this.configService.get<boolean>('HARD_DELETE_ORDERS_ENABLED') === true
    );
  }

  private getObjectBody(body: unknown) {
    if (!body || typeof body !== 'object') {
      return {};
    }

    return body as Record<string, unknown>;
  }

  private async getOrderOrThrow(id: string) {
    const order = await this.prismaService.order.findUnique({
      where: {
        id,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }
}
