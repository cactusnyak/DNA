import { getProducts } from '@/entities/product/api/get-products';
import { PLATFORM_SECTION } from '@/shared/platform';
import { useFeedChunkSize } from '@/shared/hooks/use-feed-chunk-size';
import { usePageScrollLazyLoading } from '@/shared/hooks/use-page-scroll-lazy-loading';
import { getItemGridClasses } from '@/shared/utils/get-item-grid-classes';

import { ProductCard } from '@/widgets/ProductsListing/components/ProductCard';

type ProductsFeedProps = {
  categorySlug?: string;
  emptyText?: string;
};

export function ProductsFeed({
  categorySlug,
  emptyText = 'Товары пока не добавлены.',
}: ProductsFeedProps) {
  const { initialChunkSize, chunkSize } = useFeedChunkSize('default');

  const { items, isLoading, hasMore, error } = usePageScrollLazyLoading({
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
          <ProductCard key={product.id} product={product} />
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
