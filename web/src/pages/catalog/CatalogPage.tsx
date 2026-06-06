import { Catalog } from '@/widgets/Catalog';

export function CatalogPage() {
  return (
    <Catalog
      title="Каталог"
      showHeader
      showControls
      showFilters
      showSorting
    />
  );
}