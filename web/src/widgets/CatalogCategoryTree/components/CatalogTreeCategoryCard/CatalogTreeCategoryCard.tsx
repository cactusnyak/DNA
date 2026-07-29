import { ChevronDown, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { getCategoryHref } from '@/shared/catalog';
import type { PlatformSectionId } from '@/shared/platform';
import type { CatalogCategory } from '@/shared/types/catalog-category';
import { MarkHighlight } from '@/widgets/MarkHighlight';

import { CatalogTreeCategoryImage } from '../CatalogTreeCategoryImage';

type CatalogTreeCategoryCardProps = {
  section: PlatformSectionId;
  category: CatalogCategory;
  categories: CatalogCategory[];
  hasChildren: boolean;
  isExpanded: boolean;
  isMatched: boolean;
  searchValue: string;
  onToggle: () => void;
};

export function CatalogTreeCategoryCard({
  section,
  category,
  categories,
  hasChildren,
  isExpanded,
  isMatched,
  searchValue,
  onToggle,
}: CatalogTreeCategoryCardProps) {
  return (
    <div
      className={[
        'flex items-center gap-2 rounded-lg px-3 py-2',
        isMatched &&
          'outline outline-1 outline-dashed outline-muted-foreground/30',
      ].filter(Boolean).join(' ')}
    >
      <button
        type="button"
        disabled={!hasChildren}
        onClick={onToggle}
        className={[
          'flex size-7 items-center justify-center rounded-md',
          hasChildren
            ? 'cursor-pointer hover:bg-muted'
            : 'cursor-default opacity-30',
        ].filter(Boolean).join(' ')}
      >
        {isExpanded ? (
          <ChevronDown className="size-4" />
        ) : (
          <ChevronRight className="size-4" />
        )}
      </button>

      <CatalogTreeCategoryImage category={category} />

      <Link
        to={getCategoryHref(categories, category.id, section)}
        className="text-sm font-medium underline-offset-4 hover:underline"
      >
        <MarkHighlight
          text={category.name}
          searchValue={searchValue}
          level={1}
        />
      </Link>
    </div>
  );
}
