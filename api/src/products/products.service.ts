import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

type FindAllProductsParams = {
  categorySlug?: string;
};

type CategoryNode = {
  id: string;
  parentId: string | null;
};

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService) { }

  async findAll(params: FindAllProductsParams = {}) {
    const categoryIds = params.categorySlug
      ? await this.getCategoryWithDescendantIds(params.categorySlug)
      : undefined;

    const products = await this.prismaService.product.findMany({
      where: categoryIds
        ? {
          categoryId: {
            in: categoryIds,
          },
        }
        : undefined,
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

  private async getCategoryWithDescendantIds(categorySlug: string) {
    const rootCategory = await this.prismaService.category.findUnique({
      where: {
        slug: categorySlug,
      },
      select: {
        id: true,
      },
    });

    if (!rootCategory) {
      return [];
    }

    const categories = await this.prismaService.category.findMany({
      select: {
        id: true,
        parentId: true,
      },
    });

    const categoryIds = this.collectDescendantCategoryIds(
      categories,
      rootCategory.id,
    );

    return categoryIds;
  }

  private collectDescendantCategoryIds(
    categories: CategoryNode[],
    rootCategoryId: string,
  ) {
    const categoryIds = new Set<string>([rootCategoryId]);

    let shouldContinue = true;

    while (shouldContinue) {
      shouldContinue = false;

      categories.forEach((category) => {
        if (
          category.parentId &&
          categoryIds.has(category.parentId) &&
          !categoryIds.has(category.id)
        ) {
          categoryIds.add(category.id);
          shouldContinue = true;
        }
      });
    }

    return Array.from(categoryIds);
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