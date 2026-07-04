import type { CatalogCategory } from '@/shared/types/catalog-category';

export function getChildrenCategories(
  categories: CatalogCategory[],
  parentId?: string,
) {
  return categories.filter((category) => category.parentId === parentId);
}

