import { Link } from 'react-router-dom';

import type { CatalogCategory } from '@/shared/types/catalog-category';
import { getCategoryHref } from '@/shared/catalog';
import type { PlatformSectionId } from '@/shared/platform';
import { CategoryImage } from '@/widgets/CategoryImage';

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
      className="group relative block overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/10"
    >
      {/* Full-width category image */}
      <div className="aspect-square">
        <CategoryImage 
          category={category} 
          size="full"
          placeholderMode="full"
          className="h-full w-full"
        />
      </div>

      {/* Hover overlay with category name */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <span className="text-center text-white font-medium px-3">
          {category.name}
        </span>
      </div>
    </Link>
  );
}

