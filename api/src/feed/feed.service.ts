import { Injectable } from '@nestjs/common';

import { AdCategoriesService } from '../ad-categories/ad-categories.service';
import { AdsService } from '../ads/ads.service';
import { MarketCategoriesService } from '../market-categories/market-categories.service';
import { ProductsService } from '../products/products.service';

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

@Injectable()
export class FeedService {
  constructor(
    private readonly productsService: ProductsService,
    private readonly adsService: AdsService,
    private readonly marketCategoriesService: MarketCategoriesService,
    private readonly adCategoriesService: AdCategoriesService,
  ) {}

  async buildFeed(config: FeedConfig = DEFAULT_FEED_CONFIG): Promise<FeedItem[]> {
    const [
      marketCategories,
      adCategories,
      products,
      ads,
    ] = await Promise.all([
      this.marketCategoriesService.findAll(),
      this.adCategoriesService.findAll(),
      this.productsService.findAll({ sort: 'createdAt:desc' }),
      this.adsService.findAll({ sort: 'createdAt:desc' }),
    ]);

    const marketCategoryById = new Map(
      marketCategories.map((category) => [
        category.id,
        { ...category, parentId: category.parentId ?? null },
      ]),
    );
    const adCategoryById = new Map(
      adCategories.map((category) => [
        category.id,
        { ...category, parentId: category.parentId ?? null },
      ]),
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
      marketCategories.map((category) => ({
        ...category,
        parentId: category.parentId ?? null,
      })),
      new Map(
        [...productsByCategoryId.entries()].map(([catId, prods]) => [
          catId,
          prods.map((p) => p.id),
        ]),
      ),
    );

    const adIdQueues = buildCategoryQueues(
      adCategories.map((category) => ({
        ...category,
        parentId: category.parentId ?? null,
      })),
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
            category: product.category,
            title: product.title,
            slug: product.slug,
            description: product.description,
            price: product.price,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
            images: product.images,
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
            category: ad.category,
            seller: ad.seller,
            title: ad.title,
            slug: ad.slug,
            description: ad.description,
            price: ad.price,
            status: ad.status,
            moderatedAt: ad.moderatedAt,
            createdAt: ad.createdAt,
            updatedAt: ad.updatedAt,
            contactPhone: ad.contactPhone ?? undefined,
            contactTelegram: ad.contactTelegram ?? undefined,
            contactEmail: ad.contactEmail ?? undefined,
            contactOther: ad.contactOther ?? undefined,
            images: ad.images,
          },
        });
      }
    }

    return feedItems;
  }
}
