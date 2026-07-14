import { useRef } from 'react';

import { useParams } from 'react-router-dom';

import { getCategorySlugFromPath } from '@/shared/catalog';
import {
  PLATFORM_SECTION,
  type PlatformSectionId,
} from '@/shared/platform';

import { AdsFeed } from '@/widgets/AdsFeed';

import { CatalogControls } from './components/CatalogControls';
import { CatalogHeader } from './components/CatalogHeader';
import { ProductGrid } from './components/ProductGrid';
import { useAdsControls } from './hooks/use-ads-controls';
import { useCatalogProducts } from './hooks/use-catalog-products';

type CatalogProps = {
  section: PlatformSectionId;
  title?: string;
  showHeader?: boolean;
  showCatalogLink?: boolean;
  showControls?: boolean;
  showFilters?: boolean;
  showSorting?: boolean;
};

export function Catalog({
  section,
  title = 'Каталог',
  showHeader = true,
  showCatalogLink = false,
  showControls = true,
  showFilters = true,
  showSorting = true,
}: CatalogProps) {
  const { '*': categoryPath } = useParams();
  const categorySlug = getCategorySlugFromPath(categoryPath);
  const containerRef = useRef<HTMLDivElement>(null);

  const shouldShowControls = showControls && (showFilters || showSorting);

  const {
    baseProducts,
    products,
    priceFilter,
    selectedCategoryIds,
    sortRules,
    isPending: isProductsPending,
    error: productsError,
    setPriceFilter,
    setSelectedCategoryIds,
    setSortRules,
  } = useCatalogProducts({ section, categorySlug });

  const {
    baseAds,
    ads,
    subcategoryOptions: adsSubcategoryOptions,
    priceFilter: adsPriceFilter,
    selectedCategoryIds: adsSelectedCategoryIds,
    sortRules: adsSortRules,
    isPending: isAdsPending,
    error: adsError,
    setPriceFilter: setAdsPriceFilter,
    setSelectedCategoryIds: setAdsSelectedCategoryIds,
    setSortRules: setAdsSortRules,
  } = useAdsControls({ categorySlug });

  const isPending = section === PLATFORM_SECTION.ADS ? isAdsPending : isProductsPending;
  const error = section === PLATFORM_SECTION.ADS ? adsError : productsError;

  if (isPending) {
    return (
      <section className="space-y-4">
        {showHeader && (
          <CatalogHeader
            section={section}
            title={title}
            showCatalogLink={showCatalogLink}
          />
        )}
        <p className="text-muted-foreground">Загрузка...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-4">
        {showHeader && (
          <CatalogHeader
            section={section}
            title={title}
            showCatalogLink={showCatalogLink}
          />
        )}
        <p className="text-destructive">Не удалось загрузить данные</p>
      </section>
    );
  }

  if (section === PLATFORM_SECTION.ADS) {
    return (
      <section className="space-y-8">
        {showHeader && (
          <CatalogHeader
            section={section}
            title={title}
            showCatalogLink={showCatalogLink}
          />
        )}

        <div ref={containerRef} className={shouldShowControls ? 'grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]' : 'grid gap-6'}>
          {shouldShowControls && (
            <CatalogControls
              products={baseAds}
              priceFilter={adsPriceFilter}
              selectedCategoryIds={adsSelectedCategoryIds}
              sortRules={adsSortRules}
              showFilters={showFilters}
              showSorting={showSorting}
              subcategoryOptions={adsSubcategoryOptions}
              containerRef={containerRef}
              onPriceFilterChange={setAdsPriceFilter}
              onSelectedCategoryIdsChange={setAdsSelectedCategoryIds}
              onSortRulesChange={setAdsSortRules}
            />
          )}

          <AdsFeed
            ads={ads}
            compact={shouldShowControls}
            emptyText={
              categorySlug
                ? 'В этой категории пока нет объявлений.'
                : 'Объявлений пока не размещено.'
            }
          />
        </div>
      </section>
    );
  }

  const emptyProductsText = categorySlug
    ? 'В этой категории пока нет товаров.'
    : 'Товары маркета пока не добавлены. Каталог пуст, зато не врёт.';

  return (
    <section className="space-y-8">
      {showHeader && (
        <CatalogHeader
          section={section}
          title={title}
          showCatalogLink={showCatalogLink}
        />
      )}

      <div
        ref={containerRef}
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
            containerRef={containerRef}
            onPriceFilterChange={setPriceFilter}
            onSelectedCategoryIdsChange={setSelectedCategoryIds}
            onSortRulesChange={setSortRules}
          />
        )}

        {products.length ? (
          <ProductGrid
            section={section}
            products={products}
            currentCategorySlug={categorySlug}
            compact={shouldShowControls}
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
            {emptyProductsText}
          </div>
        )}
      </div>
    </section>
  );
}

