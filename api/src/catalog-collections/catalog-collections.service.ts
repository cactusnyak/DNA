import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CatalogCollectionType } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

const ACTIVE_CATALOG_ITEM_WHERE = {
  isActive: true,
  deletedAt: null,
};

@Injectable()
export class CatalogCollectionsService {
  constructor(private readonly prismaService: PrismaService) {}

  async findBySlug(slug: string) {
    const collection = await this.prismaService.catalogCollection.findFirst({
      where: {
        slug,
        isActive: true,
      },
      include: {
        categories: {
          where: {
            category: ACTIVE_CATALOG_ITEM_WHERE,
          },
          include: {
            category: {
              include: {
                image: true,
              },
            },
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
        products: {
          where: {
            product: {
              ...ACTIVE_CATALOG_ITEM_WHERE,
              category: ACTIVE_CATALOG_ITEM_WHERE,
            },
          },
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
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    });

    if (!collection) {
      throw new NotFoundException('Catalog collection not found');
    }

    const activeCategories = await this.getActiveCategories();
    const categoryById = new Map(
      activeCategories.map((category) => [category.id, category]),
    );

    return {
      id: collection.id,
      slug: collection.slug,
      type: collection.type,
      title: collection.title,
      description: collection.description ?? undefined,
      categories:
        collection.type === CatalogCollectionType.CATEGORY
          ? collection.categories.map((item) =>
              this.mapCategory(item.category, categoryById),
            )
          : [],
      products:
        collection.type === CatalogCollectionType.PRODUCT
          ? collection.products.map((item) =>
              this.mapProduct(item.product, categoryById),
            )
          : [],
    };
  }

  private getActiveCategories() {
    return this.prismaService.marketCategory.findMany({
      where: ACTIVE_CATALOG_ITEM_WHERE,
      include: {
        image: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });
  }

  private getCategoryPath(
    category: {
      id: string;
      slug: string;
      parentId: string | null;
    },
    categoryById: Map<string, any>,
  ) {
    const parts: string[] = [];
    let currentCategory = category;

    while (currentCategory) {
      parts.unshift(currentCategory.slug);

      if (!currentCategory.parentId) {
        break;
      }

      currentCategory = categoryById.get(currentCategory.parentId);
    }

    return parts.join('/');
  }

  private mapCategory(category: any, categoryById: Map<string, any>) {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      path: this.getCategoryPath(category, categoryById),
      sortOrder: category.sortOrder,
      description: category.description ?? undefined,
      parentId: category.parentId ?? undefined,
      image: category.image ?? undefined,
    };
  }

  private mapProduct(product: any, categoryById: Map<string, any>) {
    return {
      id: product.id,
      categoryId: product.categoryId,
      category: this.mapCategory(product.category, categoryById),
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
