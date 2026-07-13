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
import { getSearchResults } from './logic/search-logic';

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
  const [userExpandedCategoryIds, setUserExpandedCategoryIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [userCollapsedCategoryIds, setUserCollapsedCategoryIds] = useState<Set<string>>(
    () => new Set(),
  );

  const sectionConfig = getPlatformSection(section);

  const searchResults = useMemo(
    () => getSearchResults(categories, searchValue),
    [categories, searchValue],
  );

  const { visibleCategories, expandedCategories: autoExpandedIds, hasAnyMatches } = searchResults;

  // Calculate final expanded state - auto-expand unless user explicitly collapsed
  const expandedCategoryIds = useMemo(() => {
    const expanded = new Set<string>();
    
    // Start with auto-expanded categories
    autoExpandedIds.forEach(id => {
      if (!userCollapsedCategoryIds.has(id)) {
        expanded.add(id);
      }
    });
    
    // Add user-expanded categories (these take priority)
    userExpandedCategoryIds.forEach(id => expanded.add(id));
    
    return expanded;
  }, [autoExpandedIds, userExpandedCategoryIds, userCollapsedCategoryIds]);

  const rootCategories = getChildrenCategories(visibleCategories);

  function handleToggle(categoryId: string) {
    const isCurrentlyExpanded = expandedCategoryIds.has(categoryId);
    
    if (isCurrentlyExpanded) {
      // User is collapsing
      setUserExpandedCategoryIds(current => {
        const newSet = new Set(current);
        newSet.delete(categoryId);
        return newSet;
      });
      
      // If this was auto-expanded, remember user collapsed it
      if (autoExpandedIds.has(categoryId)) {
        setUserCollapsedCategoryIds(current => {
          const newSet = new Set(current);
          newSet.add(categoryId);
          return newSet;
        });
      }
    } else {
      // User is expanding
      setUserExpandedCategoryIds(current => {
        const newSet = new Set(current);
        newSet.add(categoryId);
        return newSet;
      });
      
      // Remove from collapsed set if user previously collapsed it
      setUserCollapsedCategoryIds(current => {
        const newSet = new Set(current);
        newSet.delete(categoryId);
        return newSet;
      });
    }
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
              searchValue={searchValue}
              onToggle={handleToggle}
            />
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
          {searchValue.trim() && !hasAnyMatches
            ? 'Совпадений не найдено.'
            : emptyText}
        </div>
      )}
    </div>
  );
}

