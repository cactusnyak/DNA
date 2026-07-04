import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';

import type { CatalogCategory } from '@/shared/types/catalog-category';
import { getCategoryHref } from '@/shared/catalog';
import type { PlatformSectionId } from '@/shared/platform';
import { cn } from '@/shared/utils/cn';

import { getChildrenCategories } from '../../logic/get-children-categories';

type CategoryTreeNodeProps = {
  section: PlatformSectionId;
  category: CatalogCategory;
  categories: CatalogCategory[];
  expandedCategoryIds: Set<string>;
  onToggle: (categoryId: string) => void;
};

export function CategoryTreeNode({
  section,
  category,
  categories,
  expandedCategoryIds,
  onToggle,
}: CategoryTreeNodeProps) {
  const childrenCategories = getChildrenCategories(categories, category.id);
  const hasChildren = childrenCategories.length > 0;
  const isExpanded = expandedCategoryIds.has(category.id);

  return (
    <li className="space-y-1">
      <div className="flex items-center gap-2 rounded-lg bg-card px-3 py-2">
        <button
          type="button"
          disabled={!hasChildren}
          onClick={() => onToggle(category.id)}
          className={cn(
            'flex size-7 items-center justify-center rounded-md',
            hasChildren
              ? 'cursor-pointer hover:bg-muted'
              : 'cursor-default opacity-30',
          )}
        >
          {isExpanded ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
        </button>

        <Link
          to={getCategoryHref(categories, category.id, section)}
          className="text-sm font-medium underline-offset-4 hover:underline"
        >
          {category.name}
        </Link>
      </div>

      {hasChildren && isExpanded && (
        <ul className="space-y-1 pl-6">
          {childrenCategories.map((childCategory) => (
            <CategoryTreeNode
              key={childCategory.id}
              section={section}
              category={childCategory}
              categories={categories}
              expandedCategoryIds={expandedCategoryIds}
              onToggle={onToggle}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

