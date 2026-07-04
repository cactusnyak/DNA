import type { UIEvent } from 'react';

import type { CatalogCategory } from '@/shared/types/catalog-category';
import type { Product } from '@/entities/product';
import {
  getPlatformSection,
  type PlatformSectionId,
} from '@/shared/platform';

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

  onProductResultsScroll,
  onNavigate,
}: GlobalSearchDropdownProps) {
  const sectionConfig = getPlatformSection(section);
  const scopedSearchDescription = sectionConfig
    ? `Начните вводить запрос. Сейчас поиск работает в разделе «${sectionConfig.label}» и умеет находить разделы, категории и карточки выбранного раздела.`
    : 'Начните вводить запрос. Сейчас активный раздел не выбран, поэтому поиск покажет только разделы платформы.';

  return (
    <div className="absolute top-full right-0 left-0 z-[70] pt-2">
      <div className="overflow-hidden rounded-2xl border border-border bg-popover p-4 text-popover-foreground shadow-xl">
        {!isSearchReady ? (
          <div className="rounded-xl bg-muted/40 px-4 py-4 text-sm text-muted-foreground">
            {scopedSearchDescription}
          </div>
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
                </div>
              </>
            ) : (
              <div className="py-3 text-sm text-muted-foreground">
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

