import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type FindAllProductsParams = {
  categoryId?: string;
};

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService) { }

  async findAll(params: FindAllProductsParams = {}) {
    const products = await this.prismaService.product.findMany({
      where: {
        categoryId: params.categoryId,
      },
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

    return products.map((product) => this.mapProduct(product));
  }

  async findById(productId: string) {
    const product = await this.prismaService.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        images: {
          include: {
            image: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.mapProduct(product);
  }

  private mapProduct(product: any) {
    return {
      id: product.id,
      categoryId: product.categoryId,
      title: product.title,
      slug: product.slug,
      description: product.description,
      price: product.price,
      images: product.images
        .map((productImage: any) => productImage.image)
        .sort(
          (firstImage: any, secondImage: any) =>
            firstImage.sortOrder - secondImage.sortOrder,
        ),
    };
  }
}