import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type FindAllProductsParams = {
  categoryId?: string;
};

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(params: FindAllProductsParams = {}) {
    const products = await this.prismaService.product.findMany({
      where: {
        categoryId: params.categoryId,
      },
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
      category: {
        id: product.category.id,
        name: product.category.name,
        slug: product.category.slug,
        sortOrder: product.category.sortOrder,
        description: product.category.description ?? undefined,
        parentId: product.category.parentId ?? undefined,
        image: product.category.image ?? undefined,
      },
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