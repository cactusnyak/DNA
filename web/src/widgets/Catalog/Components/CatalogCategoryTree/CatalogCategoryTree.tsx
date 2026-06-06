import type { Category } from '@/entities/category';
import { cn } from '@/shared/utils/cn';

type CatalogCategoryTreeProps = {
  categories: Category[];
  selectedCategoryId?: string;
  onCategoryChange: (categoryId?: string) => void;
};

export function CatalogCategoryTree({
  categories,
  selectedCategoryId,
  onCategoryChange,
}: CatalogCategoryTreeProps) {
  const rootCategories = categories.filter((category) => !category.parentId);

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onCategoryChange(undefined)}
        className={cn(
          'cursor-pointer rounded-md border border-border px-3 py-1 text-sm transition-colors',
          !selectedCategoryId
            ? 'bg-primary text-primary-foreground'
            : 'bg-background hover:bg-muted',
        )}
      >
        Все товары
      </button>

      {rootCategories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => onCategoryChange(category.id)}
          className={cn(
            'cursor-pointer rounded-md border border-border px-3 py-1 text-sm transition-colors',
            selectedCategoryId === category.id
              ? 'bg-primary text-primary-foreground'
              : 'bg-background hover:bg-muted',
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}