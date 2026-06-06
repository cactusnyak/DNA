import type { Category } from '@/entities/category';

export type CategoryBreadcrumb = {
  label: string;
  href: string;
};

export function getCategoryBreadcrumbs(
  categories: Category[],
  currentCategorySlug?: string,
): CategoryBreadcrumb[] {
  const breadcrumbs: CategoryBreadcrumb[] = [
    {
      label: 'Каталог',
      href: '/catalog',
    },
  ];

  if (!currentCategorySlug) {
    return breadcrumbs;
  }

  const categoryBySlug = new Map<string, Category>();
  const categoryById = new Map<string, Category>();

  categories.forEach((category) => {
    categoryBySlug.set(category.slug, category);
    categoryById.set(category.id, category);
  });

  const currentCategory = categoryBySlug.get(currentCategorySlug);

  if (!currentCategory) {
    return breadcrumbs;
  }

  const categoryPath: Category[] = [];
  let category: Category | undefined = currentCategory;

  while (category) {
    categoryPath.unshift(category);

    if (!category.parentId) {
      break;
    }

    category = categoryById.get(category.parentId);
  }

  return [
    ...breadcrumbs,
    ...categoryPath.map((category) => ({
      label: category.name,
      href: `/catalog/${category.slug}`,
    })),
  ];
}