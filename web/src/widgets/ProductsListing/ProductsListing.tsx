import { getProducts } from '@/entities/product/api/get-products';
import { PLATFORM_SECTION } from '@/shared/platform';
import { useGridColumns } from '@/shared/hooks/use-grid-columns';
import { usePageScrollLazyLoading } from '@/shared/hooks/use-page-scroll-lazy-loading';
import { getItemGridClasses } from '@/shared/utils/get-item-grid-classes';
import { ProductCard } from '@/widgets/Catalog/components/ProductGrid/components/ProductCard';


type ProductsListingProps = {
  categorySlug?: string;
  emptyText?: string;
};

export function ProductsListing({
  categorySlug,
  emptyText = 'Товары пока не добавлены.',
}: ProductsListingProps) {
  const columns = useGridColumns('default');
  const chunkSize = columns * 2;
  const initialChunkSize = columns * 3;

  const {
    items,
    isLoading,
    hasMore,
    error,
  } = usePageScrollLazyLoading({
    fetchFunction: async () => {
      const response = await getProducts({
        section: PLATFORM_SECTION.MARKET,
        categorySlug,
        sortRules: [{ field: 'title', direction: 'desc' }],
      });

      return response.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
    initialChunkSize,
    chunkSize,
  });

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/20 p-5">
        <p className="text-sm text-destructive">
          Не удалось загрузить товары: {error}
        </p>
      </div>
    );
  }

  if (!isLoading && !items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={getItemGridClasses()}>
        {items.map((product) => (
          <ProductCard
            key={product.id}
            section={PLATFORM_SECTION.MARKET}
            product={product}
          />
        ))}
      </div>
      
      {isLoading && items.length > 0 && (
        <div className="flex justify-center py-8">
          <div className="flex gap-2">
            {Array.from({ length: Math.min(chunkSize, 4) }).map((_, index) => (
              <div
                key={`loading-${index}`}
                className="w-16 h-16 bg-muted rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      )}
      
      {!hasMore && items.length > 0 && (
        <div className="text-center py-8 text-sm text-muted-foreground">
          Показаны все товары
        </div>
      )}
    </div>
  );
}
