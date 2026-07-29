import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getProducts } from '@/entities/product/api/get-products';
import type { PlatformSectionId } from '@/shared/platform';

import type { CatalogPriceFilterValue } from '../components/CatalogControls/components/CatalogFilters/types/catalog-filters';
import { getSubcategoryOptions } from '../components/CatalogControls/components/CatalogFilters/logic/get-subcategory-options';
import type { CatalogSortRule } from '../components/CatalogControls/components/CatalogSorting/types/catalog-sorting';
import { getPriceFilterValue } from '../logic/get-price-filter-value';

type UseCatalogProductsParams = {
  section: PlatformSectionId;
  categorySlug?: string;
};

export function useCatalogProducts({
  section,
  categorySlug,
}: UseCatalogProductsParams) {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [sortRules, setSortRules] = useState<CatalogSortRule[]>([]);

  const {
    data: baseProducts = [],
    isPending: isBaseProductsPending,
    error: baseProductsError,
  } = useQuery({
    queryKey: ['products', section, 'base', categorySlug],
    queryFn: () =>
      getProducts({
        section,
        categorySlug,
      }),
  });

  const priceBounds = useMemo(
    () => getPriceFilterValue(baseProducts),
    [baseProducts],
  );
  const subcategoryOptions = useMemo(
    () =>
      getSubcategoryOptions(
        categorySlug
          ? baseProducts.filter(
              (product) => product.category.slug !== categorySlug,
            )
          : baseProducts,
      ),
    [baseProducts, categorySlug],
  );

  const [priceFilter, setPriceFilter] = useState<CatalogPriceFilterValue>({
    from: priceBounds.from,
    to: priceBounds.to,
  });

  useEffect(() => {
    setPriceFilter({
      from: priceBounds.from,
      to: priceBounds.to,
    });
    setSelectedCategoryIds([]);
    setSortRules([]);
  }, [section, categorySlug, priceBounds.from, priceBounds.to]);

  const isFilteredQueryEnabled = baseProducts.length > 0;

  const {
    data: filteredProducts = [],
    isPending: isFilteredProductsPending,
    error: filteredProductsError,
  } = useQuery({
    queryKey: [
      'products',
      section,
      'filtered',
      categorySlug,
      priceFilter.from,
      priceFilter.to,
      selectedCategoryIds,
      sortRules,
    ],
    queryFn: () =>
      getProducts({
        section,
        categorySlug,
        priceFrom: priceFilter.from,
        priceTo: priceFilter.to,
        categoryIds: selectedCategoryIds,
        sortRules,
      }),
    enabled: isFilteredQueryEnabled,
  });

  return {
    baseProducts,
    products: isFilteredQueryEnabled ? filteredProducts : baseProducts,
    subcategoryOptions,
    priceFilter,
    selectedCategoryIds,
    sortRules,
    isPending:
      isBaseProductsPending ||
      (isFilteredQueryEnabled && isFilteredProductsPending),
    error: baseProductsError ?? filteredProductsError,
    setPriceFilter,
    setSelectedCategoryIds,
    setSortRules,
  };
}
