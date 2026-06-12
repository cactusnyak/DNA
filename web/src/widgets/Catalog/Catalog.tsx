import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { getProducts } from '@/entities/product/api/get-products';
import { getCategorySlugFromPath } from '@/entities/category/utils/category-path';

import { CatalogControls } from './components/CatalogControls';
import { CatalogHeader } from './components/CatalogHeader';
import { ProductGrid } from './components/ProductGrid';
import type { CatalogPriceFilterValue } from './components/CatalogControls/components/CatalogFilters/types/catalog-filters';
import type { CatalogSortRule } from './components/CatalogControls/components/CatalogSorting/types/catalog-sorting';

type CatalogProps = {
  title?: string;
  showHeader?: boolean;
  showCatalogLink?: boolean;
  showControls?: boolean;
  showFilters?: boolean;
  showSorting?: boolean;
};

function getPriceBounds(products: { price: number }[]) {
  if (!products.length) {
    return {
      from: 0,
      to: 0,
    };
  }

  const prices = products.map((product) => product.price);

  return {
    from: Math.min(...prices),
    to: Math.max(...prices),
  };
}

export function Catalog({
  title = 'Каталог',
  showHeader = true,
  showCatalogLink = false,
  showControls = true,
  showFilters = true,
  showSorting = true,
}: CatalogProps) {
  const { '*': categoryPath } = useParams();
  const categorySlug = getCategorySlugFromPath(categoryPath);

  const shouldShowControls = showControls && (showFilters || showSorting);

  const { data: baseProducts = [] } = useQuery({
    queryKey: ['products', 'base', categorySlug],
    queryFn: () =>
      getProducts({
        categorySlug,
      }),
  });

  const priceBounds = useMemo(
    () => getPriceBounds(baseProducts),
    [baseProducts],
  );

  const [priceFilter, setPriceFilter] = useState<CatalogPriceFilterValue>({
    from: priceBounds.from,
    to: priceBounds.to,
  });

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [sortRules, setSortRules] = useState<CatalogSortRule[]>([]);

  useEffect(() => {
    setPriceFilter({
      from: priceBounds.from,
      to: priceBounds.to,
    });
    setSelectedCategoryIds([]);
    setSortRules([]);
  }, [categorySlug, priceBounds.from, priceBounds.to]);

  const {
    data: products = [],
    isPending,
    error,
  } = useQuery({
    queryKey: [
      'products',
      'filtered',
      categorySlug,
      priceFilter.from,
      priceFilter.to,
      selectedCategoryIds,
      sortRules,
    ],
    queryFn: () =>
      getProducts({
        categorySlug,
        priceFrom: priceFilter.from,
        priceTo: priceFilter.to,
        categoryIds: selectedCategoryIds,
        sortRules,
      }),
    enabled: Boolean(baseProducts.length),
  });

  if (isPending) {
    return (
      <section className="space-y-4">
        {showHeader && (
          <CatalogHeader title={title} showCatalogLink={showCatalogLink} />
        )}

        <p className="text-muted-foreground">Загрузка товаров...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-4">
        {showHeader && (
          <CatalogHeader title={title} showCatalogLink={showCatalogLink} />
        )}

        <p className="text-destructive">Не удалось загрузить товары</p>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      {showHeader && (
        <CatalogHeader title={title} showCatalogLink={showCatalogLink} />
      )}

      <div
        className={
          shouldShowControls
            ? 'grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]'
            : 'grid gap-6'
        }
      >
        {shouldShowControls && (
          <CatalogControls
            products={baseProducts}
            priceFilter={priceFilter}
            selectedCategoryIds={selectedCategoryIds}
            sortRules={sortRules}
            showFilters={showFilters}
            showSorting={showSorting}
            onPriceFilterChange={setPriceFilter}
            onSelectedCategoryIdsChange={setSelectedCategoryIds}
            onSortRulesChange={setSortRules}
          />
        )}

        <ProductGrid products={products} currentCategorySlug={categorySlug} />
      </div>
    </section>
  );
}