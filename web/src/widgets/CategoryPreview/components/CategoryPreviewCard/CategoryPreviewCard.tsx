import { Link } from 'react-router-dom';
import { Grid2X2 } from 'lucide-react';

import type { Category } from '@/entities/category';
import { getCategoryHref } from '@/entities/category/utils/category-path';

type CategoryPreviewCardProps = {
  category: Category;
  categories: Category[];
};

export function CategoryPreviewCard({
  category,
  categories,
}: CategoryPreviewCardProps) {
  return (
    <Link
      to={getCategoryHref(categories, category.id)}
      className="flex flex-col items-center gap-1 rounded-lg border border-border bg-card p-4 text-center transition-colors hover:bg-muted"
    >
      <div className="flex size-12 items-center justify-center overflow-hidden rounded-lg">
        {category.image?.url ? (
          <img
            src={category.image.url}
            alt={category.image.alt ?? category.name}
            className="size-7 object-contain"
          />
        ) : (
          <Grid2X2 className="size-7 text-muted-foreground" />
        )}
      </div>

      <span className="text-sm font-medium">{category.name}</span>
    </Link>
  );
}