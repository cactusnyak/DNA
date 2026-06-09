import { Catalog } from '@/widgets/Catalog';

export function CategoryPage() {
  return (
    <Catalog
      title="Популярные товары"
      showHeader
      showControls
      showFilters
      showSorting
    />
  );
}