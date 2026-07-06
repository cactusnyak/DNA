import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { OrderStatus } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import type { CreateOrderDto, CreateOrderItemDto } from './dto/create-order.dto';

type NormalizedOrderItem = {
  productId: string;
  quantity: number;
};

@Injectable()
export class OrdersService {
  constructor(private readonly prismaService: PrismaService) { }

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

    const customerEmail = this.getOptionalString(createOrderDto.customerEmail);
    const comment = this.getOptionalString(createOrderDto.comment);
    const guestSessionId = this.getOptionalString(createOrderDto.guestSessionId);

    const normalizedItems = this.getNormalizedItems(createOrderDto.items);
    const productIds = normalizedItems.map((item) => item.productId);

    const products = await this.prismaService.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      select: {
        id: true,
        price: true,
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

    const orderItems = normalizedItems.map((item) => {
      const product = productById.get(item.productId);

      if (!product) {
        throw new BadRequestException(`Product not found: ${item.productId}`);
      }

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
      };
    });

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
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
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: this.getOrderInclude(),
    });

    return this.mapOrder(order);
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

    return orders.map((order) => this.mapOrder(order));
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

    return this.mapOrder(order);
  }

  private getOrderInclude() {
    return {
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

    const quantityByProductId = new Map<string, number>();

    items.forEach((item) => {
      if (!item?.productId) {
        throw new BadRequestException('productId is required');
      }

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        throw new BadRequestException('quantity must be a positive integer');
      }

      quantityByProductId.set(
        item.productId,
        (quantityByProductId.get(item.productId) ?? 0) + quantity,
      );
    });

    return Array.from(quantityByProductId.entries()).map<NormalizedOrderItem>(
      ([productId, quantity]) => ({
        productId,
        quantity,
      }),
    );
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
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        product: item.product ? this.mapOrderProduct(item.product) : undefined,
      })),
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