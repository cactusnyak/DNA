import type { UIEvent } from 'react';

import type { Ad } from '@/entities/ad';
import type { CatalogCategory } from '@/shared/types/catalog-category';
import type { Product } from '@/entities/product';
import { PLATFORM_SECTION } from '@/shared/platform';

import { GlobalSearchAdResults } from '../GlobalSearchAdResults';
import { GlobalSearchCategoryResults } from '../GlobalSearchCategoryResults';
import { GlobalSearchProductResults } from '../GlobalSearchProductResults';
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
  const globalSearchDescription =
    'Начните вводить запрос. Поиск по всем разделам: маркет, доска объявлений и их категории.';

  return (
    <div className="absolute top-full right-0 left-0 z-[70] min-w-[320px] pt-2">
      <div className="overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-xl">
        {!isSearchReady ? (
          <p className="rounded-xl bg-muted/40 px-4 py-4 text-sm text-muted-foreground leading-[1.5]">
            {globalSearchDescription}
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            <div className="pb-3">
              <GlobalSearchSectionResults
                sections={sections}
                onNavigate={onNavigate}
              />
            </div>

            <GlobalSearchCategoryResults
              section={PLATFORM_SECTION.MARKET}
              title="Категории маркета"
              categories={marketCategoryResults}
              allCategories={marketCategories}
              searchValue={searchValue}
              isPending={isMarketCategoriesPending}
              isError={isMarketCategoriesError}
              onNavigate={onNavigate}
            />

            <GlobalSearchCategoryResults
              section={PLATFORM_SECTION.ADS}
              title="Категории доски"
              categories={adsCategoryResults}
              allCategories={adsCategories}
              searchValue={searchValue}
              isPending={isAdsCategoriesPending}
              isError={isAdsCategoriesError}
              onNavigate={onNavigate}
            />

            <GlobalSearchProductResults
              products={products}
              totalProducts={totalProducts}
              searchValue={searchValue}
              isPending={isProductsPending}
              isError={isProductsError}
              hasMoreProducts={hasMoreProducts}
              onScroll={onProductResultsScroll}
              onNavigate={onNavigate}
            />

            <GlobalSearchAdResults
              ads={ads}
              totalAds={totalAds}
              searchValue={searchValue}
              isPending={isAdsPending}
              isError={isAdsError}
              hasMoreAds={hasMoreAds}
              onScroll={onAdResultsScroll}
              onNavigate={onNavigate}
            />
          </div>
        )}
      </div>
    </div>
  );
}

