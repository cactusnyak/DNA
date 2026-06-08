import { ChevronRight, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';

import type { Category } from '@/entities/category';
import { getCategoryHref } from '@/entities/category/utils/category-path';
import { cn } from '@/shared/utils/cn';

const MAX_VISIBLE_CATEGORY_COLUMNS = 3;

type CatalogDropdownTreeProps = {
  categories: Category[];
  activeCategorySlug?: string;
  onActiveCategoryChange: (categorySlug?: string) => void;
  onCategoryClick?: () => void;
};

type CategoryLevel = {
  level: number;
  parentId?: string;
  categories: Category[];
};

function getChildrenCategories(categories: Category[], parentId?: string) {
  return categories.filter((category) => category.parentId === parentId);
}

function getActiveCategoryPath(
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

  const path: Category[] = [];
  let currentCategory: Category | undefined = activeCategory;

  while (currentCategory) {
    path.unshift(currentCategory);

    if (!currentCategory.parentId) {
      break;
    }

    currentCategory = categoriesById.get(currentCategory.parentId);
  }

  return path;
}

function getCategoryLevels(
  categories: Category[],
  activeCategoryPath: Category[],
): CategoryLevel[] {
  const levels: CategoryLevel[] = [];

  let parentId: string | undefined;

  for (let level = 0; level <= activeCategoryPath.length; level += 1) {
    const levelCategories = getChildrenCategories(categories, parentId);

    if (!levelCategories.length) {
      break;
    }

    levels.push({
      level,
      parentId,
      categories: levelCategories,
    });

    parentId = activeCategoryPath[level]?.id;

    if (!parentId) {
      break;
    }
  }

  return levels;
}

function getVisibleCategoryLevels(levels: CategoryLevel[]) {
  if (levels.length <= MAX_VISIBLE_CATEGORY_COLUMNS) {
    return {
      hiddenLevels: [],
      visibleLevels: levels,
    };
  }

  return {
    hiddenLevels: levels.slice(0, levels.length - MAX_VISIBLE_CATEGORY_COLUMNS),
    visibleLevels: levels.slice(-MAX_VISIBLE_CATEGORY_COLUMNS),
  };
}

type CollapsedAncestorsProps = {
  activeCategoryPath: Category[];
  hiddenLevelsCount: number;
  onActiveCategoryChange: (categorySlug?: string) => void;
  onCategoryClick?: () => void;
};

function CollapsedAncestors({
  activeCategoryPath,
  hiddenLevelsCount,
  onActiveCategoryChange,
  onCategoryClick,
}: CollapsedAncestorsProps) {
  const hiddenPath = activeCategoryPath.slice(0, hiddenLevelsCount);

  if (!hiddenPath.length) {
    return null;
  }

  return (
    <div className="w-44 shrink-0 border-r border-border/70 pr-2">
      <ul className="space-y-1 p-1">
        <li>
          <Link
            to="/catalog"
            onClick={onCategoryClick}
            onMouseEnter={() => onActiveCategoryChange(undefined)}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <MoreHorizontal className="size-4 shrink-0" />
            <span className="line-clamp-1">Все товары</span>
          </Link>
        </li>

        {hiddenPath.map((category) => (
          <li key={category.id}>
            <Link
              to={getCategoryHref(categories, category.id)}
              onClick={onCategoryClick}
              onMouseEnter={() => onActiveCategoryChange(category.slug)}
              className="flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <span className="line-clamp-1">{category.name}</span>
              <ChevronRight className="size-4 shrink-0" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

type CategoryColumnProps = {
  categories: Category[];
  level: CategoryLevel;
  activeCategoryPath: Category[];
  activeCategorySlug?: string;
  onActiveCategoryChange: (categorySlug?: string) => void;
  onCategoryClick?: () => void;
};

function CategoryColumn({
  categories,
  level,
  activeCategoryPath,
  activeCategorySlug,
  onActiveCategoryChange,
  onCategoryClick,
}: CategoryColumnProps) {
  const activePathCategoryIds = activeCategoryPath.map((category) => category.id);

  return (
    <div className="w-52 shrink-0 pr-2">
      <ul className="space-y-1 p-1">
        {level.level === 0 && (
          <li>
            <Link
              to="/catalog"
              onClick={onCategoryClick}
              onMouseEnter={() => onActiveCategoryChange(undefined)}
              className={cn(
                'flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                !activeCategorySlug
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <span className="line-clamp-1">Все товары</span>
            </Link>
          </li>
        )}

        {level.categories.map((category) => {
          const hasChildren = getChildrenCategories(categories, category.id).length > 0;

          const isActive = activeCategorySlug === category.slug;
          const isInPath = activePathCategoryIds.includes(category.id);

          return (
            <li key={category.id}>
              <Link
                to={getCategoryHref(categories, category.id)}
                onClick={onCategoryClick}
                onMouseEnter={() => onActiveCategoryChange(category.slug)}
                className={cn(
                  'flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                  isActive || isInPath
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <span className="line-clamp-1">{category.name}</span>

                {hasChildren && <ChevronRight className="size-4 shrink-0" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function CatalogDropdownTree({
  categories,
  activeCategorySlug,
  onActiveCategoryChange,
  onCategoryClick,
}: CatalogDropdownTreeProps) {
  const activeCategoryPath = getActiveCategoryPath(
    categories,
    activeCategorySlug,
  );

  const levels = getCategoryLevels(categories, activeCategoryPath);

  const { hiddenLevels, visibleLevels } = getVisibleCategoryLevels(levels);

  return (
    <div className="flex h-full min-h-0 max-w-full overflow-hidden">
      <CollapsedAncestors
        activeCategoryPath={activeCategoryPath}
        hiddenLevelsCount={hiddenLevels.length}
        onActiveCategoryChange={onActiveCategoryChange}
        onCategoryClick={onCategoryClick}
      />

      <div className="flex min-w-0 overflow-hidden">
        {visibleLevels.map((level) => (
          <CategoryColumn
            key={`${level.level}-${level.parentId ?? 'root'}`}
            categories={categories}
            level={level}
            activeCategoryPath={activeCategoryPath}
            activeCategorySlug={activeCategorySlug}
            onActiveCategoryChange={onActiveCategoryChange}
            onCategoryClick={onCategoryClick}
          />
        ))}
      </div>
    </div>
  );
}