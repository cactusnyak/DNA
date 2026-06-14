import { useMemo, useState } from 'react';

import { SearchInput } from '@/components/ui/SearchInput';
import { SectionHeader } from '@/components/ui/Section';
import type { Category } from '@/entities/category';

import { CategoryTreeNode } from './components/CategoryTreeNode';
import { getChildrenCategories } from './logic/get-children-categories';
import { getVisibleCategories } from './logic/get-visible-categories';
import { toggleExpandedCategoryId } from './logic/toggle-expanded-category-id';

type CatalogCategoryTreeProps = {
  categories: Category[];
};

export function CatalogCategoryTree({
  categories,
}: CatalogCategoryTreeProps) {
  const [searchValue, setSearchValue] = useState('');
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<Set<string>>(
    () => new Set(),
  );

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
        title="Каталог"
        description="Полное дерево категорий с поиском и раскрытием узлов."
      />

      <SearchInput
        value={searchValue}
        placeholder="Поиск категории"
        className="h-10"
        onChange={(event) => setSearchValue(event.target.value)}
      />

      <ul className="space-y-2">
        {rootCategories.map((category) => (
          <CategoryTreeNode
            key={category.id}
            category={category}
            categories={visibleCategories}
            expandedCategoryIds={expandedCategoryIds}
            onToggle={handleToggle}
          />
        ))}
      </ul>
    </div>
  );
}