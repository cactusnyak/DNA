import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import type { CatalogCategory } from '@/shared/types/catalog-category';
import { getCategoryHref } from '@/shared/catalog';
import {
  getPlatformCatalogHref,
  type PlatformSectionId,
} from '@/shared/platform';
import { cn } from '@/shared/utils/cn';

import { getChildrenCategories } from '../../logic/get-children-categories';
import type { CategoryLevel } from '../../types/category-level';

type CategoryColumnProps = {
  section: PlatformSectionId;
  categories: CatalogCategory[];
  level: CategoryLevel;
  activeCategoryPath: CatalogCategory[];
  activeCategorySlug?: string;
  onActiveCategoryChange: (categorySlug?: string) => void;
  onCategoryClick?: () => void;
};

export function CategoryColumn({
  section,
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
              to={getPlatformCatalogHref(section)}
              onClick={onCategoryClick}
              onMouseEnter={() => onActiveCategoryChange(undefined)}
              className={cn(
                'flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                !activeCategorySlug
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <span className="line-clamp-1">Все категории</span>
            </Link>
          </li>
        )}

        {level.categories.map((category) => {
          const hasChildren =
            getChildrenCategories(categories, category.id).length > 0;

          const isActive = activeCategorySlug === category.slug;
          const isInPath = activePathCategoryIds.includes(category.id);

          return (
            <li key={category.id}>
              <Link
                to={getCategoryHref(categories, category.id, section)}
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

