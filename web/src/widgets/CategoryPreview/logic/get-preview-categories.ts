import type { Category } from '@/entities/category';

export function getPreviewCategories(categories: Category[], limit: number) {
  return categories
    .filter((category) => !category.parentId)
    .slice(0, limit);
}