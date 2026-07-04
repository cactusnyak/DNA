import type { CatalogCategory } from '@/shared/types/catalog-category';

export function getVisibleCategories(
  categories: CatalogCategory[],
  searchValue: string,
) {
  const normalizedSearchValue = searchValue.trim().toLowerCase();

  if (!normalizedSearchValue) {
    return categories;
  }

  return categories.filter((category) =>
    category.name.toLowerCase().includes(normalizedSearchValue),
  );
}

