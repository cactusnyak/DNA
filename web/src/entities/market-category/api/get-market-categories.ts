import { httpClient } from '@/shared/api/http-client';

import type { MarketCategory } from '../types/market-category';

export function getMarketCategories() {
  return httpClient<MarketCategory[]>('/market/categories');
}
