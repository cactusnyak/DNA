import { useParams } from 'react-router-dom';

import { getCategorySlugFromPath } from '@/entities/category/utils/category-path';

import { CatalogControls } from './components/CatalogControls';
import { CatalogHeader } from './components/CatalogHeader';
import { ProductGrid } from './components/ProductGrid';
import { useCatalogProducts } from './hooks/use-catalog-products';

type CatalogProps = {
  title?: string;
  showHeader?: boolean;
  showCatalogLink?: boolean;
  showControls?: boolean;
  showFilters?: boolean;
  showSorting?: boolean;
};

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

  const {
    baseProducts,
    products,
    priceFilter,
    selectedCategoryIds,
    sortRules,
    isPending,
    error,
    setPriceFilter,
    setSelectedCategoryIds,
    setSortRules,
  } = useCatalogProducts({
    categorySlug,
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

        <ProductGrid
          products={products}
          currentCategorySlug={categorySlug}
          compact={shouldShowControls}
        />
      </div>
    </section>
  );
}