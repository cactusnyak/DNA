import { useMemo, useState } from 'react';

import { SearchInput } from '@/components/ui/SearchInput';
import { SectionHeader } from '@/components/ui/Section';
import type { CatalogCategory } from '@/shared/types/catalog-category';
import {
  getPlatformSection,
  type PlatformSectionId,
} from '@/shared/platform';

import { CategoryTreeNode } from './components/CategoryTreeNode';
import { getChildrenCategories } from './logic/get-children-categories';
import { getVisibleCategories } from './logic/get-visible-categories';
import { toggleExpandedCategoryId } from './logic/toggle-expanded-category-id';

type CatalogCategoryTreeProps = {
  section: PlatformSectionId;
  categories: CatalogCategory[];
  title?: string;
  description?: string;
  emptyText?: string;
};

export function CatalogCategoryTree({
  section,
  categories,
  title,
  description,
  emptyText = 'Категории не найдены.',
}: CatalogCategoryTreeProps) {
  const [searchValue, setSearchValue] = useState('');
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<Set<string>>(
    () => new Set(),
  );

  const sectionConfig = getPlatformSection(section);

  const visibleCategories = useMemo(
    () => getVisibleCategories(categories, searchValue),
    [categories, searchValue],
  );

  const normalizedSearchValue = searchValue.trim().toLowerCase();

  const rootCategories = normalizedSearchValue
    ? visibleCategories
    : getChildrenCategories(visibleCategories);

  function handleToggle(categoryId: string) {
    setExpandedCategoryIds((currentCategoryIds) =>
      toggleExpandedCategoryId(currentCategoryIds, categoryId),
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title={title ?? sectionConfig.catalogLabel}
        description={description ?? sectionConfig.catalogDescription}
      />

      <SearchInput
        value={searchValue}
        placeholder="Поиск категории"
        className="h-10"
        onChange={(event) => setSearchValue(event.target.value)}
      />

      {rootCategories.length ? (
        <ul className="space-y-2">
          {rootCategories.map((category) => (
            <CategoryTreeNode
              key={category.id}
              section={section}
              category={category}
              categories={visibleCategories}
              expandedCategoryIds={expandedCategoryIds}
              onToggle={handleToggle}
            />
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
          {emptyText}
        </div>
      )}
    </div>
  );
}

