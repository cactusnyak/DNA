import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prismaService: PrismaService) {}

  async getOverview() {
    const [
      usersCount,
      categoriesCount,
      productsCount,
      ordersCount,
    ] = await this.prismaService.$transaction([
      this.prismaService.user.count(),
      this.prismaService.category.count(),
      this.prismaService.product.count(),
      this.prismaService.order.count(),
    ]);

    return {
      usersCount,
      categoriesCount,
      productsCount,
      ordersCount,
    };
  }
}