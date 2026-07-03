import type { UIEvent } from 'react';

import type { Category } from '@/entities/category';
import type { Product } from '@/entities/product';
import {
  DEFAULT_PLATFORM_SECTION_ID,
  getPlatformSection,
  type PlatformSectionId,
} from '@/shared/platform';

import { GlobalSearchCategoryResults } from '../GlobalSearchCategoryResults';
import { GlobalSearchProductResults } from '../GlobalSearchProductResults';
import { GlobalSearchSectionResults } from '../GlobalSearchSectionResults';
import type { GlobalSearchSection } from '../../types/global-search';

type GlobalSearchDropdownProps = {
  section?: PlatformSectionId;
  isSearchReady: boolean;

  sections: GlobalSearchSection[];

  categories: Category[];
  allCategories: Category[];
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
  section = DEFAULT_PLATFORM_SECTION_ID,
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

  return (
    <div className="absolute left-0 right-0 top-full z-[70] pt-2">
      <div className="overflow-hidden rounded-2xl border border-border bg-popover p-4 text-popover-foreground shadow-xl">
        {!isSearchReady ? (
          <div className="rounded-xl bg-muted/40 px-4 py-4 text-sm text-muted-foreground">
            Начните вводить запрос. Сейчас поиск работает в разделе «{sectionConfig.label}»
            и умеет находить разделы, категории и товары маркета.
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            <div className="pb-3">
              <GlobalSearchSectionResults
                sections={sections}
                onNavigate={onNavigate}
              />
            </div>

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
          </div>
        )}
      </div>
    </div>
  );
}
