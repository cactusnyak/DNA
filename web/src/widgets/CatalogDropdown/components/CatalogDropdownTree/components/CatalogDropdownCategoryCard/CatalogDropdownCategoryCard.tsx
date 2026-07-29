import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { getCategoryHref } from '@/shared/catalog';
import type { PlatformSectionId } from '@/shared/platform';
import type { CatalogCategory } from '@/shared/types/catalog-category';
import { cn } from '@/shared/utils/cn';

import { CatalogDropdownCategoryImage } from '../CatalogDropdownCategoryImage';

type CatalogDropdownCategoryCardProps = {
  section: PlatformSectionId;
  category: CatalogCategory;
  categories: CatalogCategory[];
  isActive: boolean;
  isInActivePath: boolean;
  hasChildren: boolean;
  onMouseEnter: () => void;
  onClick?: () => void;
};

export function CatalogDropdownCategoryCard({
  section,
  category,
  categories,
  isActive,
  isInActivePath,
  hasChildren,
  onMouseEnter,
  onClick,
}: CatalogDropdownCategoryCardProps) {
  return (
    <Link
      to={getCategoryHref(categories, category.id, section)}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={cn(
        'flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm transition-colors',
        isActive || isInActivePath
          ? 'text-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <CatalogDropdownCategoryImage category={category} />
        <span className="line-clamp-1">{category.name}</span>
      </div>

      {hasChildren && <ChevronRight className="size-4 shrink-0" />}
    </Link>
  );
}
