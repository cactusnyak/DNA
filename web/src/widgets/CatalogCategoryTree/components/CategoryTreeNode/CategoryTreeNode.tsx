import type { CatalogCategory } from '@/shared/types/catalog-category';
import type { PlatformSectionId } from '@/shared/platform';

import { getChildrenCategories } from '../../logic/get-children-categories';
import { CatalogTreeCategoryCard } from '../CatalogTreeCategoryCard';

type CategoryTreeNodeProps = {
  section: PlatformSectionId;
  category: CatalogCategory;
  categories: CatalogCategory[];
  expandedCategoryIds: Set<string>;
  searchValue: string;
  onToggle: (categoryId: string) => void;
};

export function CategoryTreeNode({
  section,
  category,
  categories,
  expandedCategoryIds,
  searchValue,
  onToggle,
}: CategoryTreeNodeProps) {
  const childrenCategories = getChildrenCategories(categories, category.id);
  const hasChildren = childrenCategories.length > 0;
  const isExpanded = expandedCategoryIds.has(category.id);
  
  const normalizedSearchValue = searchValue.trim().toLowerCase();
  const isMatched = Boolean(
    normalizedSearchValue &&
      category.name.toLowerCase().includes(normalizedSearchValue),
  );

  return (
    <li className="space-y-1">
      <CatalogTreeCategoryCard
        section={section}
        category={category}
        categories={categories}
        hasChildren={hasChildren}
        isExpanded={isExpanded}
        isMatched={isMatched}
        searchValue={searchValue}
        onToggle={() => onToggle(category.id)}
      />

      {hasChildren && isExpanded && (
        <ul className="space-y-1 pl-6">
          {childrenCategories.map((childCategory) => (
            <CategoryTreeNode
              key={childCategory.id}
              section={section}
              category={childCategory}
              categories={categories}
              expandedCategoryIds={expandedCategoryIds}
              searchValue={searchValue}
              onToggle={onToggle}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
