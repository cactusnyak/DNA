import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getAds } from '@/entities/ad';
import type { Ad } from '@/entities/ad';

import type { CatalogPriceFilterValue } from '../components/CatalogControls/components/CatalogFilters/types/catalog-filters';
import type { CatalogSortRule } from '../components/CatalogControls/components/CatalogSorting/types/catalog-sorting';
import { getPriceFilterValue } from '../logic/get-price-filter-value';

type UseAdsControlsParams = {
  categorySlug?: string;
};

function buildSortParam(sortRules: CatalogSortRule[]) {
  if (!sortRules.length) return 'createdAt:desc';
  return sortRules.map((r) => `${r.field}:${r.direction}`).join(',');
}

function applyClientFilters(
  ads: Ad[],
  priceFilter: CatalogPriceFilterValue,
  selectedCategoryIds: string[],
): Ad[] {
  return ads.filter((ad) => {
    if (ad.price < priceFilter.from || ad.price > priceFilter.to) return false;
    if (selectedCategoryIds.length && !selectedCategoryIds.includes(ad.categoryId)) return false;
    return true;
  });
}

export function useAdsControls({ categorySlug }: UseAdsControlsParams = {}) {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [sortRules, setSortRules] = useState<CatalogSortRule[]>([]);

  const {
    data: baseAds = [],
    isPending,
    error,
  } = useQuery({
    queryKey: ['ads', 'base', categorySlug],
    queryFn: () => getAds({ categorySlug }),
  });

  const priceBounds = useMemo(() => getPriceFilterValue(baseAds), [baseAds]);

  const [priceFilter, setPriceFilter] = useState<CatalogPriceFilterValue>({
    from: priceBounds.from,
    to: priceBounds.to,
  });

  useEffect(() => {
    setPriceFilter({ from: priceBounds.from, to: priceBounds.to });
    setSelectedCategoryIds([]);
    setSortRules([]);
  }, [categorySlug, priceBounds.from, priceBounds.to]);

  const ads = useMemo(() => {
    const filtered = applyClientFilters(baseAds, priceFilter, selectedCategoryIds);
    const sortParam = buildSortParam(sortRules);
    const [field, dir] = sortParam.split(':');
    return [...filtered].sort((a, b) => {
      const aVal = a[field as keyof Ad] ?? '';
      const bVal = b[field as keyof Ad] ?? '';
      const cmp = String(aVal).localeCompare(String(bVal), 'ru', { numeric: true });
      return dir === 'desc' ? -cmp : cmp;
    });
  }, [baseAds, priceFilter, selectedCategoryIds, sortRules]);

  const subcategoryOptions = useMemo(() => {
    const map = new Map<string, { id: string; name: string; productsCount: number }>();
    baseAds.forEach((ad) => {
      if (!ad.category) return;
      const cur = map.get(ad.categoryId);
      map.set(ad.categoryId, cur
        ? { ...cur, productsCount: cur.productsCount + 1 }
        : { id: ad.categoryId, name: ad.category.name, productsCount: 1 },
      );
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  }, [baseAds]);

  return {
    baseAds,
    ads,
    subcategoryOptions,
    priceFilter,
    selectedCategoryIds,
    sortRules,
    isPending,
    error,
    setPriceFilter,
    setSelectedCategoryIds,
    setSortRules,
  };
}
