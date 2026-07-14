import { Injectable } from '@nestjs/common';
import { AdStatus } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { buildCategoryQueues, buildFeed } from './feed-builder';
import type { FeedConfig, FeedItem } from './feed.types';

const DEFAULT_FEED_CONFIG: FeedConfig = {
  sampleSize: 2,
  firstCategoryScope: 'MARKET',
  categoryRatio: {
    market: 1,
    ads: 1,
  },
};

const ACTIVE_WHERE = {
  isActive: true,
  deletedAt: null,
} as const;

const PUBLISHED_AD_WHERE = {
  ...ACTIVE_WHERE,
  status: AdStatus.PUBLISHED,
} as const;

@Injectable()
export class FeedService {
  constructor(private readonly prismaService: PrismaService) {}

  async buildFeed(config: FeedConfig = DEFAULT_FEED_CONFIG): Promise<FeedItem[]> {
    const [
      marketCategories,
      adCategories,
      products,
      ads,
    ] = await Promise.all([
      this.prismaService.marketCategory.findMany({
        where: ACTIVE_WHERE,
        orderBy: { sortOrder: 'asc' },
      }),
      this.prismaService.adCategory.findMany({
        where: ACTIVE_WHERE,
        orderBy: { sortOrder: 'asc' },
      }),
      this.prismaService.product.findMany({
        where: {
          ...ACTIVE_WHERE,
          category: ACTIVE_WHERE,
        },
        include: {
          category: { include: { image: true } },
          images: { include: { image: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prismaService.ad.findMany({
        where: {
          ...PUBLISHED_AD_WHERE,
          category: ACTIVE_WHERE,
        },
        include: {
          category: { include: { image: true } },
          seller: true,
          images: { include: { image: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const marketCategoryById = new Map(
      marketCategories.map((c) => [c.id, c]),
    );
    const adCategoryById = new Map(
      adCategories.map((c) => [c.id, c]),
    );

    const productsByCategoryId = new Map<string, typeof products>();
    for (const product of products) {
      const list = productsByCategoryId.get(product.categoryId) ?? [];
      list.push(product);
      productsByCategoryId.set(product.categoryId, list);
    }

    const adsByCategoryId = new Map<string, typeof ads>();
    for (const ad of ads) {
      const list = adsByCategoryId.get(ad.categoryId) ?? [];
      list.push(ad);
      adsByCategoryId.set(ad.categoryId, list);
    }

    const productIdQueues = buildCategoryQueues(
      marketCategories,
      new Map(
        [...productsByCategoryId.entries()].map(([catId, prods]) => [
          catId,
          prods.map((p) => p.id),
        ]),
      ),
    );

    const adIdQueues = buildCategoryQueues(
      adCategories,
      new Map(
        [...adsByCategoryId.entries()].map(([catId, adList]) => [
          catId,
          adList.map((a) => a.id),
        ]),
      ),
    );

    const orderedIds = buildFeed(productIdQueues, adIdQueues, config);

    const productById = new Map(products.map((p) => [p.id, p]));
    const adById = new Map(ads.map((a) => [a.id, a]));

    const feedItems: FeedItem[] = [];

    for (const { scope, id } of orderedIds) {
      if (scope === 'MARKET') {
        const product = productById.get(id);
        if (!product) continue;

        feedItems.push({
          type: 'PRODUCT',
          product: {
            id: product.id,
            categoryId: product.categoryId,
            category: this.mapMarketCategory(
              product.category,
              marketCategoryById,
            ),
            title: product.title,
            slug: product.slug,
            description: product.description,
            price: product.price,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
            images: this.mapImages(product.images),
          },
        });
      } else {
        const ad = adById.get(id);
        if (!ad) continue;

        feedItems.push({
          type: 'AD',
          ad: {
            id: ad.id,
            categoryId: ad.categoryId,
            category: ad.category
              ? this.mapAdCategory(ad.category, adCategoryById)
              : undefined,
            seller: ad.seller
              ? {
                  id: ad.seller.id,
                  firstName: ad.seller.firstName,
                  lastName: ad.seller.lastName,
                }
              : undefined,
            title: ad.title,
            slug: ad.slug,
            description: ad.description,
            price: ad.price,
            status: ad.status,
            moderatedAt: ad.moderatedAt,
            createdAt: ad.createdAt,
            updatedAt: ad.updatedAt,
            images: this.mapImages(ad.images),
          },
        });
      }
    }

    return feedItems;
  }

  private mapImages(
    imageRelations: { image: { id: string; url: string; sortOrder: number; alt?: string | null } }[],
  ) {
    return imageRelations
      .map((r) => r.image)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  private getCategoryPath(
    category: { id: string; slug: string; parentId: string | null },
    categoryById: Map<string, { id: string; slug: string; parentId: string | null }>,
  ): string {
    const parts: string[] = [];
    let current: { id: string; slug: string; parentId: string | null } | undefined = category;

    while (current) {
      parts.unshift(current.slug);
      if (!current.parentId) break;
      current = categoryById.get(current.parentId);
    }

    return parts.join('/');
  }

  private mapMarketCategory(
    category: {
      id: string;
      name: string;
      slug: string;
      sortOrder: number;
      description: string | null;
      parentId: string | null;
      image: { id: string; url: string; sortOrder: number; alt?: string | null } | null;
    },
    categoryById: Map<string, any>,
  ) {
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

  private mapAdCategory(
    category: {
      id: string;
      name: string;
      slug: string;
      sortOrder: number;
      description: string | null;
      parentId: string | null;
      image: { id: string; url: string; sortOrder: number; alt?: string | null } | null;
    },
    categoryById: Map<string, any>,
  ) {
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
}
