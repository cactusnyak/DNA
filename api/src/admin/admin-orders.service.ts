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

    return this.prismaService.order.update({
      where: {
        id,
      },
      data: {
        status: payload.status as OrderStatus,
      },
    });
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

    try {
      await this.prismaService.$transaction(async (transaction) => {
        await transaction.referralReward.deleteMany({
          where: { orderId: id },
        });

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
