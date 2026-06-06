import { Catalog } from '@/widgets/Catalog';

export function CatalogPage() {
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