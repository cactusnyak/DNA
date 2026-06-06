import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@/entities/category/api/get-categories';
import { CatalogCategoryTree } from '@/widgets/Catalog/Components/CatalogCategoryTree';

type CatalogFiltersProps = {
  selectedCategoryId?: string;
  onCategoryChange: (categoryId?: string) => void;
};

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
    return <p className="text-sm text-muted-foreground">Загрузка категорий...</p>;
  }

  if (error || !categories?.length) {
    return null;
  }

  return (
    <CatalogCategoryTree
      categories={categories}
      selectedCategoryId={selectedCategoryId}
      onCategoryChange={onCategoryChange}
    />
  );
}