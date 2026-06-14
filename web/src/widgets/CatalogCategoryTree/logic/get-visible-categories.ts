import type { Category } from '@/entities/category';

export function getVisibleCategories(
  categories: Category[],
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
