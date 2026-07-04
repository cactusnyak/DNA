import type { CatalogCategory } from '@/shared/types/catalog-category';

export function getPreviewCategories(categories: CatalogCategory[], limit: number) {
  return categories
    .filter((category) => !category.parentId)
    .slice(0, limit);
}
