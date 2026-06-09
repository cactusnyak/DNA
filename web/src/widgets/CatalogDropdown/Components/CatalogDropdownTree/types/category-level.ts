import type { Category } from '@/entities/category';

export type CategoryLevel = {
  level: number;
  parentId?: string;
  categories: Category[];
};