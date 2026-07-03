import type { Product } from '@/entities/product';
import {
  DEFAULT_PLATFORM_SECTION_ID,
  PLATFORM_SECTION,
  type PlatformSectionId,
} from '@/shared/platform';
import { httpClient } from '@/shared/api/http-client';

import type { CatalogSortRule } from '@/widgets/Catalog/components/CatalogControls/components/CatalogSorting/types/catalog-sorting';

type GetProductsParams = {
  section?: PlatformSectionId;
  categorySlug?: string;
  priceFrom?: number;
  priceTo?: number;
  categoryIds?: string[];
  sortRules?: CatalogSortRule[];
};

function buildSortParam(sortRules?: CatalogSortRule[]) {
  if (!sortRules?.length) {
    return undefined;
  }

  return sortRules
    .map((rule) => `${rule.field}:${rule.direction}`)
    .join(',');
}

export function getProducts(params: GetProductsParams = {}) {
  const section = params.section ?? DEFAULT_PLATFORM_SECTION_ID;

  if (section === PLATFORM_SECTION.ADS) {
    return Promise.resolve([] as Product[]);
  }

  return httpClient<Product[]>('/market/products', {
    query: {
      category: params.categorySlug,
      priceFrom: params.priceFrom,
      priceTo: params.priceTo,
      categoryIds: params.categoryIds?.join(','),
      sort: buildSortParam(params.sortRules),
    },
  });
}
