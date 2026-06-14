import type { Category } from '@/entities/category';

export function getChildrenCategories(
  categories: Category[],
  parentId?: string,
) {
  return categories.filter((category) => category.parentId === parentId);
}
