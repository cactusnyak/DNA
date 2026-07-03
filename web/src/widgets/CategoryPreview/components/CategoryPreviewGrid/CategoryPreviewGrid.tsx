import type { Category } from '@/entities/category';
import {
  DEFAULT_PLATFORM_SECTION_ID,
  type PlatformSectionId,
} from '@/shared/platform';

import { CategoryPreviewCard } from '../CategoryPreviewCard';

type CategoryPreviewGridProps = {
  section?: PlatformSectionId;
  categories: Category[];
  previewCategories: Category[];
};

export function CategoryPreviewGrid({
  section = DEFAULT_PLATFORM_SECTION_ID,
  categories,
  previewCategories,
}: CategoryPreviewGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
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
