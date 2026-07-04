import { httpClient } from '@/shared/api/http-client';

import type { Ad } from '../types/ad';

type GetAdsParams = {
  categorySlug?: string;
  priceFrom?: number;
  priceTo?: number;
  categoryIds?: string[];
  sort?: string;
};

export function getAds(params: GetAdsParams = {}) {
  return httpClient<Ad[]>('/ads', {
    query: {
      category: params.categorySlug,
      priceFrom: params.priceFrom,
      priceTo: params.priceTo,
      categoryIds: params.categoryIds?.join(','),
      sort: params.sort,
    },
  });
}
