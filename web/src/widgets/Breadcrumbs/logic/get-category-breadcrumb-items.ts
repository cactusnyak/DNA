import type { CatalogCategory } from '@/shared/types/catalog-category';
import { getCategoryHref } from '@/shared/catalog';
import {
  getPlatformCategoryHref,
  type PlatformSectionId,
} from '@/shared/platform';

import type { BreadcrumbItem } from '../types/breadcrumbs';

export function getCategoryBreadcrumbItems(
  categories: CatalogCategory[],
  currentCategorySlug: string,
  section: PlatformSectionId,
): BreadcrumbItem[] {
  const categoryBySlug = new Map<string, CatalogCategory>();
  const categoryById = new Map<string, CatalogCategory>();

  categories.forEach((category) => {
    categoryBySlug.set(category.slug, category);
    categoryById.set(category.id, category);
  });

  const currentCategory = categoryBySlug.get(currentCategorySlug);

  if (!currentCategory) {
    return [
      {
        id: `category-${currentCategorySlug}`,
        href: getPlatformCategoryHref(section, currentCategorySlug),
        label: currentCategorySlug,
      },
    ];
  }

  const categoryPath: CatalogCategory[] = [];
  let category: CatalogCategory | undefined = currentCategory;

  while (category) {
    categoryPath.unshift(category);

    if (!category.parentId) {
      break;
    }

    category = categoryById.get(category.parentId);
  }

  return categoryPath.map((category) => ({
    id: `category-${category.id}`,
    href: getCategoryHref(categories, category.id, section),
    label: category.name,
  }));
}

