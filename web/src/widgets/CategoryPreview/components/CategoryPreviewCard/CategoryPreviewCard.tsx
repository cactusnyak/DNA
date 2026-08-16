import { Link } from 'react-router-dom';

import type { CatalogCategory } from '@/shared/types/catalog-category';
import { getCategoryHref } from '@/shared/catalog';
import type { PlatformSectionId } from '@/shared/platform';

import {
  CategoryPreviewImage,
  categoryPreviewLabelClassName,
} from '../CategoryPreviewImage';

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
      className="group relative block h-fit w-fit overflow-hidden rounded-xl shadow-card-lg hover:border-border hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      aria-label={category.name}
    >
      <CategoryPreviewImage category={category} />

      <div
        className={`${categoryPreviewLabelClassName} absolute inset-0 bg-primary/70 text-primary-foreground opacity-0 backdrop-blur-[2px] group-hover:opacity-100 group-focus-visible:opacity-100`}
      >
        <span>{category.name}</span>
      </div>
    </Link>
  );
}
