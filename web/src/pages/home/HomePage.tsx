import { Catalog } from '@/widgets/Catalog';
import { CategoryPreview } from '@/widgets/CategoryPreview';

export function HomePage() {
  return (
    <div className="space-y-10">
      <CategoryPreview />

      <Catalog
        title="Популярные товары"
        showHeader
        showCatalogLink
        showControls={false}
      />
    </div>
  );
}