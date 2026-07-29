import type { CatalogCategory } from '@/shared/types/catalog-category';
import type { PlatformSectionId } from '@/shared/platform';

import { CategoryPreviewCard } from '../CategoryPreviewCard';

type CategoryPreviewGridProps = {
  section: PlatformSectionId;
  categories: CatalogCategory[];
  previewCategories: CatalogCategory[];
};

export function CategoryPreviewGrid({
  section,
  categories,
  previewCategories,
}: CategoryPreviewGridProps) {
  return (
    <div className="flex flex-wrap items-start gap-3">
      {previewCategories.map((category) => (
        <CategoryPreviewCard
          key={category.id}
          section={section}
          category={category}
          categories={categories}
        />
      ))}
    </div>
  );
}
