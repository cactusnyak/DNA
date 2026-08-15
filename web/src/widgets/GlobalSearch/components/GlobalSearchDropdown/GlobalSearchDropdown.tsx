import type { CSSProperties, UIEvent } from 'react';
import { Link } from 'react-router-dom';

import type { Ad } from '@/entities/ad';
import type { CatalogCategory } from '@/shared/types/catalog-category';
import type { Product } from '@/entities/product';
import { headerHeightVar } from '@/shared/header';
import { mobileNavigationHeightVar } from '@/shared/main-navigation';
import { Button } from '@/components/ui/Button';

import { GlobalSearchCategoryResults } from '../GlobalSearchCategoryResults';
import { GlobalSearchItemResults } from '../GlobalSearchItemResults';
import { GlobalSearchSectionResults } from '../GlobalSearchSectionResults';
import type { GlobalSearchSection } from '../../types/global-search';

type GlobalSearchDropdownProps = {
  isSearchReady: boolean;

  sections: GlobalSearchSection[];

  marketCategories: CatalogCategory[];
  adsCategories: CatalogCategory[];
  marketCategoryResults: CatalogCategory[];
  adsCategoryResults: CatalogCategory[];
  isMarketCategoriesPending?: boolean;
  isAdsCategoriesPending?: boolean;
  isMarketCategoriesError?: boolean;
  isAdsCategoriesError?: boolean;

  products: Product[];
  totalProducts: number;
  isProductsPending?: boolean;
  isProductsError?: boolean;
  hasMoreProducts?: boolean;

  ads: Ad[];
  totalAds: number;
  isAdsPending?: boolean;
  isAdsError?: boolean;
  hasMoreAds?: boolean;

  searchValue: string;

  onProductResultsScroll: (event: UIEvent<HTMLDivElement>) => void;
  onAdResultsScroll: (event: UIEvent<HTMLDivElement>) => void;
  onNavigate: () => void;
};

export function GlobalSearchDropdown({
  isSearchReady,

  sections,

  marketCategories,
  adsCategories,
  marketCategoryResults,
  adsCategoryResults,
  isMarketCategoriesPending = false,
  isAdsCategoriesPending = false,
  isMarketCategoriesError = false,
  isAdsCategoriesError = false,

  products,
  totalProducts,
  isProductsPending = false,
  isProductsError = false,
  hasMoreProducts = false,

  ads,
  totalAds,
  isAdsPending = false,
  isAdsError = false,
  hasMoreAds = false,

  searchValue,

  onProductResultsScroll,
  onAdResultsScroll,
  onNavigate,
}: GlobalSearchDropdownProps) {
  const globalSearchDescription = 'Найдите нужное в DNA.';
  const showItemResults =
    totalProducts > 0 ||
    totalAds > 0 ||
    isProductsPending ||
    isAdsPending ||
    isProductsError ||
    isAdsError;
  const showCategoryResults =
    marketCategoryResults.length > 0 ||
    adsCategoryResults.length > 0 ||
    isMarketCategoriesPending ||
    isAdsCategoriesPending ||
    isMarketCategoriesError ||
    isAdsCategoriesError;
  const dropdownStyle = {
    '--global-search-mobile-top': headerHeightVar(),
    '--global-search-mobile-height': `calc(100dvh - ${headerHeightVar()} - ${mobileNavigationHeightVar()} - 0.5rem)`,
  } as CSSProperties;

  return (
    <div
      className="fixed top-[var(--global-search-mobile-top)] right-0 left-0 z-[70] px-4 pt-2 md:absolute md:top-full md:px-0"
      style={dropdownStyle}
    >
      <div
        className="max-h-[var(--global-search-mobile-height)] touch-pan-y overflow-y-auto overscroll-contain rounded-2xl shadow-card-3xl bg-popover text-popover-foreground shadow-xl md:max-h-[calc(100dvh-var(--header-height,112px)-0.5rem)] border border-border"
      >
        {!isSearchReady ? (
          <p className="rounded-xl bg-muted/40 px-4 py-4 text-sm text-muted-foreground leading-[1.5]">
            {globalSearchDescription}
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {showItemResults && (
              <GlobalSearchItemResults
                products={products}
                totalProducts={totalProducts}
                ads={ads}
                totalAds={totalAds}
                searchValue={searchValue}
                isPending={isProductsPending || isAdsPending}
                isError={isProductsError || isAdsError}
                hasMore={hasMoreProducts || hasMoreAds}
                onScroll={(event) => {
                  onProductResultsScroll(event);
                  onAdResultsScroll(event);
                }}
                onNavigate={onNavigate}
              />
            )}

            {showCategoryResults && (
              <GlobalSearchCategoryResults
                marketCategories={marketCategories}
                adsCategories={adsCategories}
                marketCategoryResults={marketCategoryResults}
                adsCategoryResults={adsCategoryResults}
                searchValue={searchValue}
                isPending={
                  isMarketCategoriesPending || isAdsCategoriesPending
                }
                isError={isMarketCategoriesError || isAdsCategoriesError}
                onNavigate={onNavigate}
              />
            )}

            {sections.length > 0 && (
              <GlobalSearchSectionResults
                sections={sections}
                onNavigate={onNavigate}
              />
            )}

            <div className="p-4">
              <Button className="w-full" asChild variant="accent">
                <Link
                  to={`/search?q=${encodeURIComponent(searchValue.trim())}`}
                  onClick={onNavigate}
                >
                  Посмотреть все результаты
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
