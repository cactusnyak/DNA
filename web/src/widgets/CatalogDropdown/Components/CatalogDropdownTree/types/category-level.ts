import type { CatalogCategory } from '@/shared/types/catalog-category';

export type CategoryLevel = {
  level: number;
  parentId?: string;
  categories: CatalogCategory[];
};
