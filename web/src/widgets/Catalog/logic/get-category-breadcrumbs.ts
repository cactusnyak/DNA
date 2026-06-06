import type { Category } from '@/entities/category';

export function getCategoryBreadcrumbs(
  categories: Category[],
  selectedCategorySlug?: string,
) {
  if (!selectedCategorySlug) {
    return [];
  }

  const categoriesById = new Map(
    categories.map((category) => [category.id, category]),
  );

  const selectedCategory = categories.find(
    (category) => category.slug === selectedCategorySlug,
  );

  if (!selectedCategory) {
    return [];
  }

  const breadcrumbs: Category[] = [];
  let currentCategory: Category | undefined = selectedCategory;

  while (currentCategory) {
    breadcrumbs.unshift(currentCategory);

    if (!currentCategory.parentId) {
      break;
    }

    currentCategory = categoriesById.get(currentCategory.parentId);
  }

  return breadcrumbs;
}