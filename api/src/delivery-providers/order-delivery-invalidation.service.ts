import { Injectable } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { calculateOrderPricing } from './order-delivery-pricing';

type DeliveryImpact = {
  providerId?: string;
  serviceId?: string;
  warehouseId?: string;
  productId?: string;
};

@Injectable()
export class OrderDeliveryInvalidationService {
  constructor(private readonly prisma: PrismaService) {}

  async invalidateAffected(impact: DeliveryImpact) {
    const quotes = await this.prisma.deliveryQuote.findMany({
      where: {
        ...(impact.providerId ? { deliveryProviderId: impact.providerId } : {}),
        ...(impact.serviceId ? { deliveryServiceId: impact.serviceId } : {}),
        ...(impact.warehouseId
          ? { originWarehouseId: impact.warehouseId }
          : {}),
        order: { status: OrderStatus.AWAITING_PAYMENT },
        ...(impact.productId
          ? {
              order: {
                status: OrderStatus.AWAITING_PAYMENT,
                items: { some: { productId: impact.productId } },
              },
            }
          : {}),
      },
      select: { orderId: true },
      distinct: ['orderId'],
    });
    for (const { orderId } of quotes)
      if (orderId) await this.invalidateOrder(orderId);
  }

  async invalidateOrder(orderId: string) {
    await this.prisma.$transaction(
      async (tx) => {
        const order = await tx.order.findUnique({
          where: { id: orderId },
          select: { status: true },
        });
        if (!order || order.status !== OrderStatus.AWAITING_PAYMENT) return;
        await tx.orderDeliverySelection.deleteMany({ where: { orderId } });
        await tx.deliveryQuote.updateMany({
          where: {
            orderId,
            status: { in: ['CREATED', 'SELECTED'] },
          },
          data: { status: 'CANCELLED', quoteKey: null, selectedAt: null },
        });
        const items = await tx.orderItem.findMany({ where: { orderId } });
        const totalAmount = calculateOrderPricing(items, []).totalAmount;
        await tx.order.update({
          where: { id: orderId },
          data: {
            totalAmount,
            deliveryVersion: { increment: 1 },
            pricingVersion: { increment: 1 },
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }
}
