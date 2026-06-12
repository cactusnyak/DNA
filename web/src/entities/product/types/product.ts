import type { Category } from '@/entities/category';
import type { Image } from '@/shared/types/image';

export type Product = {
  id: string;
  category: Category;
  title: string;
  slug: string;
  description: string;
  price: number;
  createdAt: string;
  updatedAt: string;
  images: Image[];
};