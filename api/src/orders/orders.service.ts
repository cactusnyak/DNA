import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { OrderStatus, OversizedDeliveryQuoteStatus } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { OrderDeliveryService } from '../delivery-providers/order-delivery.service';
import {
  resolveSelectedProductAdditions,
  type SelectedProductAddition,
} from '../products/product-additions';

import type {
  CreateOrderDto,
  CreateOrderItemDto,
} from './dto/create-order.dto';

type NormalizedOrderItem = {
  productId: string;
  configurationKey: string;
  quantity: number;
  selectedAdditions: SelectedProductAddition[];
  deliveryQuoteId?: string;
};

@Injectable()
export class OrdersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly orderDeliveryService: OrderDeliveryService,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId?: string) {
    const customerName = this.getRequiredString(
      createOrderDto.customerName,
      'customerName',
    );

    const customerPhone = this.getRequiredString(
      createOrderDto.customerPhone,
      'customerPhone',
    );

    const deliveryAddress = this.getRequiredString(
      createOrderDto.deliveryAddress,
      'deliveryAddress',
    );

    const customerEmail = this.getRequiredString(
      createOrderDto.customerEmail,
      'customerEmail',
    );
    if (!/^\S+@\S+\.\S+$/.test(customerEmail)) {
      throw new BadRequestException('customerEmail must be a valid email');
    }
    const comment = this.getOptionalString(createOrderDto.comment);
    const guestSessionId = this.getOptionalString(
      createOrderDto.guestSessionId,
    );

    const normalizedItems = this.getNormalizedItems(createOrderDto.items);
    const productIds = Array.from(
      new Set(normalizedItems.map((item) => item.productId)),
    );

    const products = await this.prismaService.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        isActive: true,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        price: true,
        additions: true,
        location: true,
        isOversizedOverride: true,
        category: { select: { isOversized: true } },
      },
    });

    if (products.length !== productIds.length) {
      const foundProductIds = new Set(products.map((product) => product.id));

      const missingProductIds = productIds.filter(
        (productId) => !foundProductIds.has(productId),
      );

      throw new BadRequestException(
        `Products not found: ${missingProductIds.join(', ')}`,
      );
    }

    const productById = new Map(
      products.map((product) => [product.id, product]),
    );

    const quoteIds = normalizedItems
      .map((item) => item.deliveryQuoteId)
      .filter((id): id is string => Boolean(id));
    const quotes = await this.prismaService.oversizedDeliveryQuote.findMany({
      where: { id: { in: quoteIds } },
    });
    const quoteById = new Map(quotes.map((quote) => [quote.id, quote]));
    const now = new Date();
    const orderItems = normalizedItems.map((item) => {
      const product = productById.get(item.productId);

      if (!product) {
        throw new BadRequestException(`Product not found: ${item.productId}`);
      }

      const resolved = resolveSelectedProductAdditions(
        product.additions,
        item.selectedAdditions,
      );
      const isOversized =
        product.isOversizedOverride ?? product.category.isOversized;
      const quote = item.deliveryQuoteId
        ? quoteById.get(item.deliveryQuoteId)
        : undefined;
      if (isOversized) {
        if (!quote)
          throw new BadRequestException(
            `Для крупногабаритного товара ${item.productId} требуется подтверждённый расчёт доставки.`,
          );
        if (
          quote.productId !== item.productId ||
          quote.quantity !== item.quantity ||
          quote.cartLineKey !== item.configurationKey
        )
          throw new BadRequestException(
            'Расчёт доставки не соответствует товару или количеству.',
          );
        if (
          quote.userId
            ? quote.userId !== userId
            : quote.guestSessionId !== guestSessionId
        )
          throw new BadRequestException(
            'Расчёт доставки принадлежит другому покупателю.',
          );
        if (
          quote.status !== OversizedDeliveryQuoteStatus.ACCEPTED ||
          quote.confirmedDeliveryPrice == null ||
          (quote.expiresAt && quote.expiresAt <= now)
        )
          throw new BadRequestException(
            'Расчёт доставки не подтверждён или истёк.',
          );
      } else if (quote)
        throw new BadRequestException(
          'Расчёт доставки нельзя применить к обычному товару.',
        );
      return {
        productId: item.productId,
        quantity: item.quantity,
        baseUnitPrice: product.price,
        unitPrice: product.price + resolved.additionsTotal,
        selectedAdditions: resolved.snapshot,
        isOversized,
        deliveryQuoteId: quote?.id,
        deliveryPrice: quote?.confirmedDeliveryPrice ?? 0,
        deliverySnapshot: quote
          ? {
              quoteId: quote.id,
              dispatchLocation: quote.dispatchLocation,
              destinationRegion: quote.destinationRegion,
              destinationCity: quote.destinationCity,
              destinationAddress: quote.destinationAddress,
              quantity: quote.quantity,
              cartLineKey: quote.cartLineKey,
              status: quote.status,
              managerComment: quote.managerComment,
              confirmedAt: quote.updatedAt,
              expiresAt: quote.expiresAt,
            }
          : undefined,
      };
    });

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity + item.deliveryPrice,
      0,
    );

    const order = await this.prismaService.order.create({
      data: {
        userId,
        guestSessionId,
        customerName,
        customerPhone,
        customerEmail,
        deliveryAddress,
        comment,
        status: OrderStatus.AWAITING_PAYMENT,
        totalAmount,
        items: {
          create: orderItems.map((item) => ({
            product: {
              connect: {
                id: item.productId,
              },
            },
            quantity: item.quantity,
            productTitle: productById.get(item.productId)?.title,
            baseUnitPrice: item.baseUnitPrice,
            unitPrice: item.unitPrice,
            selectedAdditions: item.selectedAdditions,
            isOversized: item.isOversized,
            deliveryQuoteId: item.deliveryQuoteId,
            deliveryPrice: item.deliveryPrice,
            deliverySnapshot: item.deliverySnapshot,
          })),
        },
      },
      include: this.getOrderInclude(),
    });

    return this.mapOrderWithDelivery(order);
  }

  async findMyOrders(userId: string) {
    const orders = await this.prismaService.order.findMany({
      where: {
        userId,
      },
      include: this.getOrderInclude(),
      orderBy: {
        createdAt: 'desc',
      },
    });

    return Promise.all(orders.map((order) => this.mapOrderWithDelivery(order)));
  }

  async findById(orderId: string) {
    const order = await this.prismaService.order.findUnique({
      where: {
        id: orderId,
      },
      include: this.getOrderInclude(),
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.mapOrderWithDelivery(order);
  }

  async findOwnedById(orderId: string, userId: string) {
    const order = await this.prismaService.order.findFirst({
      where: { id: orderId, userId },
      include: this.getOrderInclude(),
    });
    if (!order) throw new NotFoundException('Order not found');
    return this.mapOrderWithDelivery(order);
  }

  async rebuildOwnedOrder(orderId: string, userId: string) {
    const order = await this.prismaService.order.findFirst({
      where: { id: orderId, userId },
      include: this.getOrderInclude(),
    });
    if (!order) throw new NotFoundException('Order not found');

    const unavailable: string[] = [];
    const items = order.items.map((item: any) => {
      const product = item.product;
      if (!product?.isActive || product.deletedAt) {
        unavailable.push(product?.title ?? item.productId);
        return undefined;
      }
      try {
        resolveSelectedProductAdditions(
          product.additions,
          (item.selectedAdditions ?? []).map(
            ({ additionId, type, value }: any) => ({
              additionId,
              type,
              value,
            }),
          ),
        );
      } catch {
        unavailable.push(product.title);
        return undefined;
      }
      return {
        product: this.mapOrderProduct(product),
        quantity: item.quantity,
        selectedAdditions: (item.selectedAdditions ?? []).map(
          ({ additionId, type, value }: any) => ({ additionId, type, value }),
        ),
      };
    });
    if (unavailable.length) {
      throw new ConflictException(
        `Нельзя восстановить позиции: ${unavailable.join(', ')}. Товар недоступен или его конфигурация изменилась.`,
      );
    }
    return {
      sourceOrderId: order.id,
      customer: {
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerEmail: order.customerEmail ?? '',
        deliveryAddress: order.deliveryAddress,
        comment: order.comment ?? '',
      },
      items,
      requiresNewDeliveryQuote: order.items.some(
        (item: any) => item.isOversized,
      ),
    };
  }

  async removeOwnedOrder(orderId: string, userId: string) {
    return this.prismaService.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, userId },
        select: {
          id: true,
          status: true,
          paymentAttempts: { select: { status: true } },
          _count: { select: { referralRewards: true } },
        },
      });
      if (!order) throw new NotFoundException('Order not found');
      if (
        order.status === OrderStatus.CREATED &&
        order.paymentAttempts.length === 0 &&
        order._count.referralRewards === 0
      ) {
        await tx.orderItem.deleteMany({ where: { orderId } });
        await tx.order.delete({ where: { id: orderId } });
        return { action: 'deleted' };
      }
      if (order.status !== OrderStatus.AWAITING_PAYMENT) {
        throw new ConflictException('Заказ в текущем статусе нельзя отменить.');
      }
      if (order.paymentAttempts.length > 0) {
        throw new ConflictException(
          'Заказ с начатой оплатой нельзя отменить до подтверждения её результата.',
        );
      }
      const updated = await tx.order.updateMany({
        where: { id: orderId, userId, status: OrderStatus.AWAITING_PAYMENT },
        data: { status: OrderStatus.CANCELLED },
      });
      if (updated.count !== 1) {
        throw new ConflictException('Статус заказа уже изменился.');
      }
      return { action: 'cancelled' };
    });
  }

  private getOrderInclude() {
    return {
      paymentAttempts: { select: { status: true } },
      items: {
        include: {
          product: {
            include: {
              category: {
                include: {
                  image: true,
                },
              },
              images: {
                include: {
                  image: true,
                },
              },
            },
          },
        },
      },
    };
  }

  private getRequiredString(value: unknown, fieldName: string) {
    if (typeof value !== 'string' || !value.trim()) {
      throw new BadRequestException(`${fieldName} is required`);
    }

    return value.trim();
  }

  private getOptionalString(value: unknown) {
    if (typeof value !== 'string') {
      return undefined;
    }

    const normalizedValue = value.trim();

    return normalizedValue || undefined;
  }

  private getNormalizedItems(items?: CreateOrderItemDto[]) {
    if (!Array.isArray(items) || !items.length) {
      throw new BadRequestException('items are required');
    }

    const itemByConfiguration = new Map<string, NormalizedOrderItem>();

    items.forEach((item) => {
      if (!item?.productId) {
        throw new BadRequestException('productId is required');
      }

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        throw new BadRequestException('quantity must be a positive integer');
      }

      const selectedAdditions = Array.isArray(item.selectedAdditions)
        ? item.selectedAdditions
        : [];
      const canonicalSelection = [...selectedAdditions].sort((first, second) =>
        first.additionId.localeCompare(second.additionId),
      );
      const keySelection = canonicalSelection.map(
        ({ additionId, type, value }) => ({ additionId, type, value }),
      );
      const key = `${item.productId}:${JSON.stringify(keySelection)}`;
      const current = itemByConfiguration.get(key);
      const deliveryQuoteId = this.getOptionalString(item.deliveryQuoteId);
      if (
        current?.deliveryQuoteId &&
        deliveryQuoteId &&
        current.deliveryQuoteId !== deliveryQuoteId
      ) {
        throw new BadRequestException(
          'У одной конфигурации товара не может быть нескольких расчётов доставки.',
        );
      }
      itemByConfiguration.set(key, {
        productId: item.productId,
        configurationKey: key,
        quantity: (current?.quantity ?? 0) + quantity,
        selectedAdditions: canonicalSelection,
        deliveryQuoteId: current?.deliveryQuoteId ?? deliveryQuoteId,
      });
    });

    return Array.from(itemByConfiguration.values());
  }

  private mapOrder(order: any) {
    return {
      id: order.id,
      userId: order.userId ?? undefined,
      guestSessionId: order.guestSessionId ?? undefined,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail ?? undefined,
      deliveryAddress: order.deliveryAddress,
      comment: order.comment ?? undefined,
      status: order.status,
      capabilities: {
        canContinue:
          order.status === OrderStatus.CREATED ||
          order.status === OrderStatus.AWAITING_PAYMENT,
        canRepeat: true,
        canRemove:
          (order.status === OrderStatus.CREATED ||
            order.status === OrderStatus.AWAITING_PAYMENT) &&
          (order.paymentAttempts?.length ?? 0) === 0,
        removeAction:
          order.status === OrderStatus.CREATED
            ? 'delete'
            : order.status === OrderStatus.AWAITING_PAYMENT
              ? 'cancel'
              : undefined,
      },
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        productTitle: item.productTitle ?? item.product?.title,
        quantity: item.quantity,
        baseUnitPrice: item.baseUnitPrice,
        unitPrice: item.unitPrice,
        selectedAdditions: item.selectedAdditions ?? [],
        isOversized: item.isOversized,
        deliveryQuoteId: item.deliveryQuoteId ?? undefined,
        deliveryPrice: item.deliveryPrice,
        deliverySnapshot: item.deliverySnapshot ?? undefined,
        product: item.product ? this.mapOrderProduct(item.product) : undefined,
      })),
    };
  }

  private async mapOrderWithDelivery(order: any) {
    return {
      ...this.mapOrder(order),
      delivery: await this.orderDeliveryService.getState(order.id),
    };
  }

  private mapOrderProduct(product: any) {
    return {
      id: product.id,
      categoryId: product.categoryId,
      category: {
        id: product.category.id,
        name: product.category.name,
        slug: product.category.slug,
        path: product.category.slug,
        sortOrder: product.category.sortOrder,
        description: product.category.description ?? undefined,
        parentId: product.category.parentId ?? undefined,
        image: product.category.image ?? undefined,
      },
      title: product.title,
      slug: product.slug,
      description: product.description,
      price: product.price,
      isActive: product.isActive,
      deletedAt: product.deletedAt,
      additions: product.additions ?? [],
      location: product.location,
      isOversizedOverride: product.isOversizedOverride,
      isOversized: product.isOversizedOverride ?? product.category.isOversized,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      images: product.images
        .map((productImage: any) => productImage.image)
        .sort(
          (firstImage: any, secondImage: any) =>
            firstImage.sortOrder - secondImage.sortOrder,
        ),
    };
  }
}
