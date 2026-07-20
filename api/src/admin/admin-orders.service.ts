import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminOrdersService {
  constructor(private readonly prismaService: PrismaService) {}

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

  async hardDeleteOrder(id: string) {
    await this.getOrderOrThrow(id);

    return this.prismaService.$transaction(async (transaction) => {
      await transaction.referralReward.deleteMany({
        where: {
          orderId: id,
        },
      });

      await transaction.orderItem.deleteMany({
        where: {
          orderId: id,
        },
      });

      return transaction.order.delete({
        where: {
          id,
        },
      });
    });
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
