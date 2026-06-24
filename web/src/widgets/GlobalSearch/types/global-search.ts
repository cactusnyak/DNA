import type { Category } from '@/entities/category';
import type { Product } from '@/entities/product';

export type GlobalSearchSection = {
  id: string;
  title: string;
  description: string;
  href: string;
  keywords: string[];
};

export type GlobalSearchCategory = Category;

export type GlobalSearchProduct = Product;