import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

type FindAllProductsParams = {
  categorySlug?: string;
  priceFrom?: number;
  priceTo?: number;
  categoryIds?: string[];
  sort?: string;
};

type CatalogSortField = 'title' | 'category' | 'createdAt' | 'price';
type CatalogSortDirection = 'asc' | 'desc';

const ACTIVE_CATEGORY_WHERE = {
  isActive: true,
  deletedAt: null,
};

const ACTIVE_PRODUCT_WHERE = {
  isActive: true,
  deletedAt: null,
};

const SORT_FIELD_WHITELIST = new Set<CatalogSortField>([
  'title',
  'category',
  'createdAt',
  'price',
]);

const SORT_DIRECTION_WHITELIST = new Set<CatalogSortDirection>([
  'asc',
  'desc',
]);

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(params: FindAllProductsParams = {}) {
    const activeCategories = await this.getActiveCategories();
    const categoryById = new Map(
      activeCategories.map((category) => [category.id, category]),
    );

    const categoryIds = await this.getFilteredCategoryIds({
      categorySlug: params.categorySlug,
      categoryIds: params.categoryIds,
      activeCategories,
    });

    const where: Prisma.ProductWhereInput = {
      ...ACTIVE_PRODUCT_WHERE,
      category: ACTIVE_CATEGORY_WHERE,
    };

    if (categoryIds?.length) {
      where.categoryId = {
        in: categoryIds,
      };
    }

    if (
      typeof params.priceFrom === 'number' ||
      typeof params.priceTo === 'number'
    ) {
      where.price = {
        gte: params.priceFrom,
        lte: params.priceTo,
      };
    }

    const products = await this.prismaService.product.findMany({
      where,
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

    return products.map((product) => this.mapProduct(product, categoryById));
  }

  async findById(productId: string) {
    const activeCategories = await this.getActiveCategories();
    const categoryById = new Map(
      activeCategories.map((category) => [category.id, category]),
    );

    const product = await this.prismaService.product.findFirst({
      where: {
        id: productId,
        ...ACTIVE_PRODUCT_WHERE,
        category: ACTIVE_CATEGORY_WHERE,
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

    return this.mapProduct(product, categoryById);
  }

  private getActiveCategories() {
    return this.prismaService.category.findMany({
      where: ACTIVE_CATEGORY_WHERE,
      include: {
        image: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });
  }

  private async getFilteredCategoryIds(params: {
    categorySlug?: string;
    categoryIds?: string[];
    activeCategories: Awaited<ReturnType<ProductsService['getActiveCategories']>>;
  }) {
    const requestedCategoryIds = params.categoryIds?.filter(Boolean) ?? [];

    if (!params.categorySlug && !requestedCategoryIds.length) {
      return undefined;
    }

    const categoryIdsFromSlug = params.categorySlug
      ? this.getCategoryAndDescendantIds({
          categorySlug: params.categorySlug,
          categories: params.activeCategories,
        })
      : undefined;

    if (categoryIdsFromSlug && !categoryIdsFromSlug.length) {
      return [];
    }

    if (!requestedCategoryIds.length) {
      return categoryIdsFromSlug;
    }

    if (!categoryIdsFromSlug) {
      return requestedCategoryIds;
    }

    const categoryIdsFromSlugSet = new Set(categoryIdsFromSlug);

    return requestedCategoryIds.filter((categoryId) =>
      categoryIdsFromSlugSet.has(categoryId),
    );
  }

  private getCategoryAndDescendantIds(params: {
    categorySlug: string;
    categories: Awaited<ReturnType<ProductsService['getActiveCategories']>>;
  }) {
    const rootCategory = params.categories.find(
      (category) => category.slug === params.categorySlug,
    );

    if (!rootCategory) {
      return [];
    }

    const childrenByParentId = new Map<string, typeof params.categories>();

    params.categories.forEach((category) => {
      if (!category.parentId) {
        return;
      }

      const children = childrenByParentId.get(category.parentId) ?? [];
      childrenByParentId.set(category.parentId, [...children, category]);
    });

    const result: string[] = [];
    const stack = [rootCategory];

    while (stack.length) {
      const category = stack.pop();

      if (!category) {
        continue;
      }

      result.push(category.id);
      stack.push(...(childrenByParentId.get(category.id) ?? []));
    }

    return result;
  }

  private getOrderBy(sort?: string): Prisma.ProductOrderByWithRelationInput[] {
    const sortRules = sort
      ?.split(',')
      .map((rawRule) => {
        const [field, direction] = rawRule.split(':');

        if (
          !SORT_FIELD_WHITELIST.has(field as CatalogSortField) ||
          !SORT_DIRECTION_WHITELIST.has(direction as CatalogSortDirection)
        ) {
          return undefined;
        }

        return {
          field: field as CatalogSortField,
          direction: direction as CatalogSortDirection,
        };
      })
      .filter(Boolean) as
      | {
          field: CatalogSortField;
          direction: CatalogSortDirection;
        }[]
      | undefined;

    if (!sortRules?.length) {
      return [
        {
          createdAt: 'desc',
        },
      ];
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
