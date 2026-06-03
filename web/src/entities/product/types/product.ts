import type { Image } from '@/shared/types/image';

export type Product = {
  id: string;
  categoryId: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  images: Image[];
};