import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

type CatalogSortField = 'title' | 'category' | 'createdAt' | 'price';
type CatalogSortDirection = 'asc' | 'desc';

type CatalogSortRule = {
  field: CatalogSortField;
  direction: CatalogSortDirection;
};

type FindAllProductsParams = {
  categorySlug?: string;
  priceFrom?: number;
  priceTo?: number;
  categoryIds?: string[];
  sort?: string;
};

type CategoryNode = {
  id: string;
  slug: string;
  parentId: string | null;
};

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(params: FindAllProductsParams = {}) {
    const categoryIds = params.categorySlug
      ? await this.getCategoryWithDescendantIds(params.categorySlug)
      : undefined;

    const filteredCategoryIds = this.getFilteredCategoryIds({
      baseCategoryIds: categoryIds,
      selectedCategoryIds: params.categoryIds,
    });

    const products = await this.prismaService.product.findMany({
      where: {
        ...(filteredCategoryIds
          ? {
              categoryId: {
                in: filteredCategoryIds,
              },
            }
          : {}),
        ...(params.priceFrom !== undefined || params.priceTo !== undefined
          ? {
              price: {
                ...(params.priceFrom !== undefined
                  ? { gte: params.priceFrom }
                  : {}),
                ...(params.priceTo !== undefined ? { lte: params.priceTo } : {}),
              },
            }
          : {}),
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
      orderBy: this.getOrderBy(params.sort),
    });

    const categoryPathById = await this.getCategoryPathById();

    return products.map((product) =>
      this.mapProduct(product, categoryPathById),
    );
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

    const categoryPathById = await this.getCategoryPathById();

    return this.mapProduct(product, categoryPathById);
  }

  private getFilteredCategoryIds(params: {
    baseCategoryIds?: string[];
    selectedCategoryIds?: string[];
  }) {
    const { baseCategoryIds, selectedCategoryIds } = params;

    if (!baseCategoryIds && !selectedCategoryIds?.length) {
      return undefined;
    }

    if (baseCategoryIds && !selectedCategoryIds?.length) {
      return baseCategoryIds;
    }

    if (!baseCategoryIds && selectedCategoryIds?.length) {
      return selectedCategoryIds;
    }

    return selectedCategoryIds?.filter((categoryId) =>
      baseCategoryIds?.includes(categoryId),
    );
  }

  private getOrderBy(sort?: string) {
    const sortRules = this.parseSortRules(sort);

    if (!sortRules.length) {
      return {
        title: 'asc' as const,
      };
    }

    return sortRules.map((rule) => {
      if (rule.field === 'category') {
        return {
          category: {
            name: rule.direction,
          },
        };
      }

      return {
        [rule.field]: rule.direction,
      };
    });
  }

  private parseSortRules(sort?: string): CatalogSortRule[] {
    if (!sort) {
      return [];
    }

    const allowedFields: CatalogSortField[] = [
      'title',
      'category',
      'createdAt',
      'price',
    ];

    return sort
      .split(',')
      .map((rule) => {
        const [field, direction] = rule.split(':');

        if (
          !allowedFields.includes(field as CatalogSortField) ||
          (direction !== 'asc' && direction !== 'desc')
        ) {
          return undefined;
        }

        return {
          field: field as CatalogSortField,
          direction,
        };
      })
      .filter((rule): rule is CatalogSortRule => Boolean(rule));
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

    return this.collectDescendantCategoryIds(categories, rootCategory.id);
  }

  private collectDescendantCategoryIds(
    categories: Pick<CategoryNode, 'id' | 'parentId'>[],
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

  private async getCategoryPathById() {
    const categories = await this.prismaService.category.findMany({
      select: {
        id: true,
        slug: true,
        parentId: true,
      },
    });

    const categoryById = new Map(
      categories.map((category) => [category.id, category]),
    );

    const categoryPathById = new Map<string, string>();

    categories.forEach((category) => {
      const parts: string[] = [];

      let currentCategory: CategoryNode | undefined = category;

      while (currentCategory) {
        parts.unshift(currentCategory.slug);

        if (!currentCategory.parentId) {
          break;
        }

        currentCategory = categoryById.get(currentCategory.parentId);
      }

      categoryPathById.set(category.id, parts.join('/'));
    });

    return categoryPathById;
  }

  private mapProduct(product: any, categoryPathById: Map<string, string>) {
    return {
      id: product.id,
      categoryId: product.categoryId,
      category: {
        id: product.category.id,
        name: product.category.name,
        slug: product.category.slug,
        path: categoryPathById.get(product.category.id) ?? product.category.slug,
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