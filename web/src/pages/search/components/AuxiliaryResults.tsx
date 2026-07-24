import type { ReactNode } from 'react';

import { getCategoryHref } from '@/shared/catalog';
import { PLATFORM_SECTION } from '@/shared/platform';
import type { CatalogCategory } from '@/shared/types/catalog-category';
import { filterGlobalSearchCategories } from '@/widgets/GlobalSearch/logic/filter-global-search-categories';
import { filterGlobalSearchSections } from '@/widgets/GlobalSearch/logic/filter-global-search-sections';

import { SearchResultPlate } from './SearchResultPlate';

type AuxiliaryResultsProps = {
  query: string;
  marketCategories: CatalogCategory[];
  adsCategories: CatalogCategory[];
};

function ResultsGroup({
  title,
  hasResults,
  children,
}: {
  title: string;
  hasResults: boolean;
  children: ReactNode;
}) {
  if (!hasResults) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">{title}</h2>

      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export function AuxiliaryResults({
  query,
  marketCategories,
  adsCategories,
}: AuxiliaryResultsProps) {
  const marketResults = filterGlobalSearchCategories(marketCategories, query);
  const adsResults = filterGlobalSearchCategories(adsCategories, query);
  const sectionResults = filterGlobalSearchSections(query);
  const categoryResults = [
    ...marketResults.map((category) => ({
      category,
      categories: marketCategories,
      section: PLATFORM_SECTION.MARKET,
    })),
    ...adsResults.map((category) => ({
      category,
      categories: adsCategories,
      section: PLATFORM_SECTION.ADS,
    })),
  ];

  return (
    <section className="space-y-5">
      <ResultsGroup title="Категории" hasResults={categoryResults.length > 0}>
        {categoryResults.map(({ category, categories, section }) => (
          <SearchResultPlate
            key={`${section}-${category.id}`}
            to={getCategoryHref(categories, category.id, section)}
            meta={section === PLATFORM_SECTION.MARKET ? 'Маркет' : 'Доска'}
          >
            {category.name}
          </SearchResultPlate>
        ))}
      </ResultsGroup>

      <ResultsGroup title="Разделы" hasResults={sectionResults.length > 0}>
        {sectionResults.map((section) => (
          <SearchResultPlate key={section.id} to={section.href}>
            {section.title}
          </SearchResultPlate>
        ))}
      </ResultsGroup>
    </section>
  );
}
