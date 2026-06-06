import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import type { Category } from '@/entities/category';
import { cn } from '@/shared/utils/cn';

type CatalogDropdownTreeProps = {
  categories: Category[];
  activeCategorySlug?: string;
  onActiveCategoryChange: (categorySlug: string) => void;
};

function getChildrenCategories(categories: Category[], parentId?: string) {
  return categories.filter((category) => category.parentId === parentId);
}

function getActivePathCategoryIds(
  categories: Category[],
  activeCategorySlug?: string,
) {
  if (!activeCategorySlug) {
    return [];
  }

  const categoriesById = new Map(
    categories.map((category) => [category.id, category]),
  );

  const activeCategory = categories.find(
    (category) => category.slug === activeCategorySlug,
  );

  if (!activeCategory) {
    return [];
  }

  const path: string[] = [];
  let currentCategory: Category | undefined = activeCategory;

  while (currentCategory) {
    path.unshift(currentCategory.id);

    if (!currentCategory.parentId) {
      break;
    }

    currentCategory = categoriesById.get(currentCategory.parentId);
  }

  return path;
}

type CategoryColumnProps = {
  categories: Category[];
  parentId?: string;
  activePathCategoryIds: string[];
  activeCategorySlug?: string;
  onActiveCategoryChange: (categorySlug: string) => void;
  level?: number;
};

function CategoryColumn({
  categories,
  parentId,
  activePathCategoryIds,
  activeCategorySlug,
  onActiveCategoryChange,
  level = 0,
}: CategoryColumnProps) {
  const columnCategories = getChildrenCategories(categories, parentId);

  if (!columnCategories.length) {
    return null;
  }

  const activeCategoryIdAtLevel = activePathCategoryIds[level];

  const activeCategory = columnCategories.find(
    (category) => category.id === activeCategoryIdAtLevel,
  );

  return (
    <>
      <div className="w-56 shrink-0 border-r border-border pr-2">
        <ul className="space-y-1">
          {columnCategories.map((category) => {
            const hasChildren = getChildrenCategories(
              categories,
              category.id,
            ).length > 0;

            const isActive = activeCategorySlug === category.slug;
            const isInPath = activePathCategoryIds.includes(category.id);

            return (
              <li key={category.id}>
                <Link
                  to={`/catalog/${category.slug}`}
                  onMouseEnter={() => onActiveCategoryChange(category.slug)}
                  className={cn(
                    'flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                    isActive || isInPath
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <span className="line-clamp-1">{category.name}</span>

                  {hasChildren && (
                    <ChevronRight className="size-4 shrink-0" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {activeCategory && (
        <CategoryColumn
          categories={categories}
          parentId={activeCategory.id}
          activePathCategoryIds={activePathCategoryIds}
          activeCategorySlug={activeCategorySlug}
          onActiveCategoryChange={onActiveCategoryChange}
          level={level + 1}
        />
      )}
    </>
  );
}

export function CatalogDropdownTree({
  categories,
  activeCategorySlug,
  onActiveCategoryChange,
}: CatalogDropdownTreeProps) {
  const rootCategories = getChildrenCategories(categories);
  const defaultCategorySlug = rootCategories[0]?.slug;
  const resolvedActiveCategorySlug = activeCategorySlug ?? defaultCategorySlug;

  const activePathCategoryIds = getActivePathCategoryIds(
    categories,
    resolvedActiveCategorySlug,
  );

  return (
    <div className="flex min-h-80 gap-2 overflow-x-auto">
      <CategoryColumn
        categories={categories}
        activePathCategoryIds={activePathCategoryIds}
        activeCategorySlug={resolvedActiveCategorySlug}
        onActiveCategoryChange={onActiveCategoryChange}
      />
    </div>
  );
}