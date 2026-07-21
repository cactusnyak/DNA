import type { CategoryLevel } from '../types/category-level';

const MAX_VISIBLE_CATEGORY_COLUMNS = 3;

export function getVisibleCategoryLevels(levels: CategoryLevel[]) {
  if (levels.length <= MAX_VISIBLE_CATEGORY_COLUMNS) {
    return {
      hiddenLevels: [],
      visibleLevels: levels,
    };
  }

  return {
    hiddenLevels: levels.slice(0, levels.length - MAX_VISIBLE_CATEGORY_COLUMNS),
    visibleLevels: levels.slice(-MAX_VISIBLE_CATEGORY_COLUMNS),
  };
}