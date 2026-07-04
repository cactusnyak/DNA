import { httpClient } from '@/shared/api/http-client';

import type { AdCategory } from '../types/ad-category';

export function getAdCategories() {
  return httpClient<AdCategory[]>('/ads/categories');
}
