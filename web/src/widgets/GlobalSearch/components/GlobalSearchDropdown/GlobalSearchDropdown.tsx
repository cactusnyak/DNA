import type { UIEvent } from 'react';

import type { Ad } from '@/entities/ad';
import type { CatalogCategory } from '@/shared/types/catalog-category';
import type { Product } from '@/entities/product';
import {
  PLATFORM_SECTION,
  getPlatformSection,
  type PlatformSectionId,
} from '@/shared/platform';

import { GlobalSearchAdRow } from '../GlobalSearchAdRow/GlobalSearchAdRow';
import { GlobalSearchCategoryResults } from '../GlobalSearchCategoryResults';
import { GlobalSearchProductResults } from '../GlobalSearchProductResults';
import { GlobalSearchSectionResults } from '../GlobalSearchSectionResults';
import type { GlobalSearchSection } from '../../types/global-search';

type GlobalSearchDropdownProps = {
  section?: PlatformSectionId | null;
  isSearchReady: boolean;

  sections: GlobalSearchSection[];

  categories: CatalogCategory[];
  allCategories: CatalogCategory[];
  isCategoriesPending?: boolean;
  isCategoriesError?: boolean;

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

  onProductResultsScroll: (event: UIEvent<HTMLDivElement>) => void;
  onNavigate: () => void;
};

export function GlobalSearchDropdown({
  section = null,
  isSearchReady,

  sections,

  categories,
  allCategories,
  isCategoriesPending = false,
  isCategoriesError = false,

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

  onProductResultsScroll,
  onNavigate,
}: GlobalSearchDropdownProps) {
  const sectionConfig = getPlatformSection(section);
  const scopedSearchDescription = sectionConfig
    ? `Начните вводить запрос. Сейчас поиск работает в разделе «${sectionConfig.label}» и умеет находить разделы, категории и карточки выбранного раздела.`
    : 'Начните вводить запрос. Сейчас активный раздел не выбран, поэтому поиск покажет только разделы платформы.';

  return (
    <div className="absolute top-full right-0 left-0 z-[70] min-w-[320px] pt-2">
      <div className="overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-xl">
        {!isSearchReady ? (
          <p className="rounded-xl bg-muted/40 px-4 py-4 text-sm text-muted-foreground leading-[1.5]">
            {scopedSearchDescription}
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            <div className="pb-3">
              <GlobalSearchSectionResults
                sections={sections}
                onNavigate={onNavigate}
              />
            </div>

            {section ? (
              <>
                <GlobalSearchCategoryResults
                  section={section}
                  categories={categories}
                  allCategories={allCategories}
                  isPending={isCategoriesPending}
                  isError={isCategoriesError}
                  onNavigate={onNavigate}
                />

                <div className="pt-3">
                  {section === PLATFORM_SECTION.ADS ? (
                    <section className="p-5">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold">Объявления</h3>
                        <span className="text-xs text-muted-foreground">{totalAds}</span>
                      </div>

                      <div
                        className="mt-3 max-h-80 overflow-y-auto pr-1"
                        onScroll={onProductResultsScroll}
                      >
                        {isAdsPending && (
                          <p className="rounded-lg bg-muted/40 px-3 py-3 text-sm text-muted-foreground">
                            Ищем объявления...
                          </p>
                        )}

                        {isAdsError && (
                          <p className="rounded-lg bg-destructive/10 px-3 py-3 text-sm text-destructive">
                            Не удалось загрузить объявления.
                          </p>
                        )}

                        {!isAdsPending && !isAdsError && ads.length === 0 && (
                          <p className="rounded-lg bg-muted/40 px-3 py-3 text-sm text-muted-foreground">
                            Объявления не найдены.
                          </p>
                        )}

                        {!isAdsPending && !isAdsError && ads.length > 0 && (
                          <div className="grid gap-1">
                            {ads.map((ad) => (
                              <GlobalSearchAdRow
                                key={ad.id}
                                ad={ad}
                                onNavigate={onNavigate}
                              />
                            ))}

                            {hasMoreAds && (
                              <p className="py-2 text-center text-xs text-muted-foreground">
                                Прокрутите ниже, чтобы показать ещё.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </section>
                  ) : (
                    <GlobalSearchProductResults
                      section={section}
                      products={products}
                      totalProducts={totalProducts}
                      isPending={isProductsPending}
                      isError={isProductsError}
                      hasMoreProducts={hasMoreProducts}
                      onScroll={onProductResultsScroll}
                      onNavigate={onNavigate}
                    />
                  )}
                </div>
              </>
            ) : (
              <div className="p-5 text-sm text-muted-foreground">
                Выберите «Доска» или «Маркет», чтобы искать по категориям и
                карточкам конкретного раздела.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

