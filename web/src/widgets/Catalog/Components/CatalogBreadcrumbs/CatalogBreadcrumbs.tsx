import { ChevronRight } from 'lucide-react';

import type { Category } from '@/entities/category';

type CatalogBreadcrumbsProps = {
  breadcrumbs: Category[];
  onCategoryChange: (categorySlug?: string) => void;
};

export function CatalogBreadcrumbs({
  breadcrumbs,
  onCategoryChange,
}: CatalogBreadcrumbsProps) {
  return (
    <nav className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
      <button
        type="button"
        onClick={() => onCategoryChange(undefined)}
        className="cursor-pointer hover:text-foreground"
      >
        Каталог
      </button>

      {breadcrumbs.map((category) => (
        <div key={category.id} className="flex items-center gap-1">
          <ChevronRight className="size-4" />

          <button
            type="button"
            onClick={() => onCategoryChange(category.slug)}
            className="cursor-pointer hover:text-foreground"
          >
            {category.name}
          </button>
        </div>
      ))}
    </nav>
  );
}