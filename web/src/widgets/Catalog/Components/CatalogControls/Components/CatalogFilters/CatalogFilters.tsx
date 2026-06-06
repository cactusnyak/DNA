import { useQuery } from '@tanstack/react-query';

import { getCategories } from '@/entities/category/api/get-categories';
import { cn } from '@/shared/utils/cn';

type CatalogFiltersProps = {
  selectedCategoryId?: string;
  onCategoryChange: (categoryId?: string) => void;
};

const filterButtonClassName = (
  isActive: boolean,
) =>
  cn(
    'cursor-pointer rounded-md border border-border px-3 py-1 text-sm transition-colors',
    isActive
      ? 'bg-primary text-primary-foreground'
      : 'bg-background hover:bg-muted',
  );

export function CatalogFilters({
  selectedCategoryId,
  onCategoryChange,
}: CatalogFiltersProps) {
  const {
    data: categories,
    isPending,
    error,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  if (isPending) {
    return (
      <p className="text-sm text-muted-foreground">
        Загрузка категорий...
      </p>
    );
  }

  if (error || !categories?.length) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onCategoryChange(undefined)}
        className={filterButtonClassName(
          !selectedCategoryId,
        )}
      >
        Все товары
      </button>

      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() =>
            onCategoryChange(category.id)
          }
          className={filterButtonClassName(
            selectedCategoryId === category.id,
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}