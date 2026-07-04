import type { MarketCategory } from '@/entities/market-category';
import type { Image } from '@/shared/types/image';

export type Product = {
  id: string;
  category: MarketCategory;
  title: string;
  slug: string;
  description: string;
  price: number;
  createdAt: string;
  updatedAt: string;
  images: Image[];
};
