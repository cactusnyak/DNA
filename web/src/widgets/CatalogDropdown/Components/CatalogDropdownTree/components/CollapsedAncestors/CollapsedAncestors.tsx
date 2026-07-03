import { ChevronRight, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';

import type { Category } from '@/entities/category';
import { getCategoryHref } from '@/entities/category/utils/category-path';
import {
  DEFAULT_PLATFORM_SECTION_ID,
  getPlatformCatalogHref,
  type PlatformSectionId,
} from '@/shared/platform';

type CollapsedAncestorsProps = {
  section?: PlatformSectionId;
  categories: Category[];
  activeCategoryPath: Category[];
  hiddenLevelsCount: number;
  onActiveCategoryChange: (categorySlug?: string) => void;
  onCategoryClick?: () => void;
};

export function CollapsedAncestors({
  section = DEFAULT_PLATFORM_SECTION_ID,
  categories,
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
            to={getPlatformCatalogHref(section)}
            onClick={onCategoryClick}
            onMouseEnter={() => onActiveCategoryChange(undefined)}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <MoreHorizontal className="size-4 shrink-0" />
            <span className="line-clamp-1">Все категории</span>
          </Link>
        </li>

        {hiddenPath.map((category) => (
          <li key={category.id}>
            <Link
              to={getCategoryHref(categories, category.id, section)}
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
