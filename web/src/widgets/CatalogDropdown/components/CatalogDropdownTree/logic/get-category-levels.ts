import type { CatalogCategory } from '@/shared/types/catalog-category';

import type { CategoryLevel } from '../types/category-level';
import { getChildrenCategories } from './get-children-categories';

export function getCategoryLevels(
  categories: CatalogCategory[],
  activeCategoryPath: CatalogCategory[],
): CategoryLevel[] {
  const levels: CategoryLevel[] = [];

  let parentId: string | undefined;

  for (let level = 0; level <= activeCategoryPath.length; level += 1) {
    const levelCategories = getChildrenCategories(categories, parentId);

    if (!levelCategories.length) {
      break;
    }

    levels.push({
      level,
      parentId,
      categories: levelCategories,
    });

    parentId = activeCategoryPath[level]?.id;

    if (!parentId) {
      break;
    }
  }

  return levels;
}
