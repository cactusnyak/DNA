import type { Category } from '@/entities/category';

export function getCategoryBreadcrumbs(
  categories: Category[],
  selectedCategoryId?: string,
) {
  if (!selectedCategoryId) {
    return [];
  }

  const categoriesById = new Map(
    categories.map((category) => [category.id, category]),
  );

  const breadcrumbs: Category[] = [];
  let currentCategory = categoriesById.get(selectedCategoryId);

  while (currentCategory) {
    breadcrumbs.unshift(currentCategory);

    if (!currentCategory.parentId) {
      break;
    }

    currentCategory = categoriesById.get(currentCategory.parentId);
  }

  return breadcrumbs;
}