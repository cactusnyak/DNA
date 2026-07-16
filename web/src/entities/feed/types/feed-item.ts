import type { Ad } from '@/entities/ad';
import type { Product } from '@/entities/product';

export type FeedProductItem = {
  type: 'PRODUCT';
  product: Product;
};

export type FeedAdItem = {
  type: 'AD';
  ad: Ad;
};

export type FeedItem = FeedProductItem | FeedAdItem;
