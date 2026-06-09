import type { Category } from '@/entities/category';

import { CategoryPreviewCard } from '../CategoryPreviewCard';

type CategoryPreviewGridProps = {
  categories: Category[];
  previewCategories: Category[];
};

export function CategoryPreviewGrid({
  categories,
  previewCategories,
}: CategoryPreviewGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {previewCategories.map((category) => (
        <CategoryPreviewCard
          key={category.id}
          category={category}
          categories={categories}
        />
      ))}
    </div>
  );
}