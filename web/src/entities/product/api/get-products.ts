import type { CatalogSortRule } from '@/widgets/Catalog/components/CatalogControls/components/CatalogSorting/types/catalog-sorting';
import type { Product } from '@/entities/product';
import { httpClient } from '@/shared/api/http-client';

type GetProductsParams = {
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
  return httpClient<Product[]>('/products', {
    query: {
      category: params.categorySlug,
      priceFrom: params.priceFrom,
      priceTo: params.priceTo,
      categoryIds: params.categoryIds?.join(','),
      sort: buildSortParam(params.sortRules),
    },
  });
}