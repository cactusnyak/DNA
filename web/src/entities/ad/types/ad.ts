import type { AdCategory } from '@/entities/ad-category';
import type { Image } from '@/shared/types/image';

import type { AdSeller } from './ad-seller';
import type { AdStatus } from './ad-status';

export type Ad = {
  id: string;
  categoryId: string;
  category?: AdCategory;
  seller?: AdSeller;
  title: string;
  slug: string;
  description: string;
  price: number;
  status: AdStatus;
  moderatedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  images: Image[];
};
