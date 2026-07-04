import { Link } from 'react-router-dom';

import type { CatalogCategory } from '@/shared/types/catalog-category';
import { getCategoryHref } from '@/shared/catalog';
import type { PlatformSectionId } from '@/shared/platform';

type CategoryPreviewCardProps = {
  section: PlatformSectionId;
  category: CatalogCategory;
  categories: CatalogCategory[];
};

export function CategoryPreviewCard({
  section,
  category,
  categories,
}: CategoryPreviewCardProps) {
  return (
    <Link
      to={getCategoryHref(categories, category.id, section)}
      className="flex flex-col items-center gap-1 rounded-lg border border-border bg-card p-4 text-center transition-colors hover:bg-muted"
    >
      <span className="text-sm font-medium">{category.name}</span>
    </Link>
  );
}

