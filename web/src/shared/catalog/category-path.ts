import {
  getPlatformCategoryHref,
  type PlatformSectionId,
} from '@/shared/platform';
import type { CatalogCategory } from '@/shared/types/catalog-category';

export function getCategoryPath(
  categories: CatalogCategory[],
  categoryId: string,
) {
  const categoryById = new Map(
    categories.map((category) => [category.id, category]),
  );

  const path: CatalogCategory[] = [];
  let category = categoryById.get(categoryId);

  while (category) {
    path.unshift(category);

    if (!category.parentId) {
      break;
    }

    category = categoryById.get(category.parentId);
  }

  return path;
}

export function getCategoryPathSlug(
  categories: CatalogCategory[],
  categoryId: string,
) {
  return getCategoryPath(categories, categoryId)
    .map((category) => category.slug)
    .join('/');
}

export function getCategoryHref(
  categories: CatalogCategory[],
  categoryId: string,
  section: PlatformSectionId,
) {
  return getPlatformCategoryHref(
    section,
    getCategoryPathSlug(categories, categoryId),
  );
}

export function getCategorySlugFromPath(categoryPath?: string) {
  if (!categoryPath) {
    return undefined;
  }

  const parts = categoryPath.split('/').filter(Boolean);

  return parts.at(-1);
}
