import type { Ad } from '@/entities/ad';
import type { Product } from '@/entities/product';

export type Favourite = {
  id: string;
  userId: string;
  productId?: string | null;
  adId?: string | null;
  createdAt: string;
  product?: Product | null;
  ad?: Ad | null;
};
