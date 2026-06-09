import type { Category } from '@/entities/category';

export function getActiveCategoryPath(
  categories: Category[],
  activeCategorySlug?: string,
) {
  if (!activeCategorySlug) {
    return [];
  }

  const categoriesById = new Map(
    categories.map((category) => [category.id, category]),
  );

  const activeCategory = categories.find(
    (category) => category.slug === activeCategorySlug,
  );

  if (!activeCategory) {
    return [];
  }

  const path: Category[] = [];
  let currentCategory: Category | undefined = activeCategory;

  while (currentCategory) {
    path.unshift(currentCategory);

    if (!currentCategory.parentId) {
      break;
    }

    currentCategory = categoriesById.get(currentCategory.parentId);
  }

  return path;
}