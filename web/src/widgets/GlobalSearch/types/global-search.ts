import type { CatalogCategory } from '@/shared/types/catalog-category';
import type { Product } from '@/entities/product';

export type GlobalSearchSection = {
  id: string;
  title: string;
  description: string;
  href: string;
  keywords: string[];
};

export type GlobalSearchCategory = CatalogCategory;

export type GlobalSearchProduct = Product;
