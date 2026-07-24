import type { CSSProperties, UIEvent } from 'react';

import type { Ad } from '@/entities/ad';
import type { CatalogCategory } from '@/shared/types/catalog-category';
import type { Product } from '@/entities/product';
import { headerHeightVar } from '@/shared/header';
import { mobileNavigationHeightVar } from '@/shared/main-navigation';

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
    '--global-search-mobile-height': `calc(100dvh - ${headerHeightVar()} - ${mobileNavigationHeightVar()} - 0.5rem)`,
  } as CSSProperties;

  return (
    <div className="absolute top-full right-0 left-0 z-[70] min-w-[320px] pt-2">
      <div
        className="max-h-[var(--global-search-mobile-height)] overflow-y-auto rounded-2xl border border-border bg-popover text-popover-foreground shadow-xl md:max-h-[calc(100dvh-var(--header-height,112px)-0.5rem)]"
        style={dropdownStyle}
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
          </div>
        )}
      </div>
    </div>
  );
}
