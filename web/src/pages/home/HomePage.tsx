import { Catalog } from '@/widgets/Catalog';

export function HomePage() {
  return (
    <div className="space-y-10">
      <Catalog
        title="Популярные товары"
        showHeader
        showCatalogLink
        showControls={false}
      />
    </div>
  );
}