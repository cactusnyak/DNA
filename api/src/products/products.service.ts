import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
    const products = await this.prismaService.product.findMany({
      include: {
        images: {
          include: {
            image: true,
          },
        },
      },
      orderBy: {
        title: 'asc',
      },
    });

    return products.map((product) => ({
      id: product.id,
      categoryId: product.categoryId,
      title: product.title,
      slug: product.slug,
      description: product.description,
      price: product.price,
      images: product.images
        .map((productImage) => productImage.image)
        .sort((firstImage, secondImage) => firstImage.sortOrder - secondImage.sortOrder),
    }));
  }
}