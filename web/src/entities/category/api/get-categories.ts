import type { Category } from '@/entities/category';
import { httpClient } from '@/shared/api/http-client';

export function getCategories() {
  return httpClient<Category[]>('/categories');
}