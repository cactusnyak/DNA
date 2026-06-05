import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService) {}

  findAll() {
    return this.prismaService.product.findMany({
      include: {
        category: true,
        images: {
          include: {
            image: true,
          },
        },
      },
    });
  }
}