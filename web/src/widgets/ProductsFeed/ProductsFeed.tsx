import { getProducts } from '@/entities/product/api/get-products';
import { EmptyPlaceholder } from '@/components/ui/EmptyPlaceholder';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { PLATFORM_SECTION } from '@/shared/platform';
import { useFeedChunkSize } from '@/shared/hooks/use-feed-chunk-size';
import { usePageScrollLazyLoading } from '@/shared/hooks/use-page-scroll-lazy-loading';
import { getItemGridClasses } from '@/shared/utils/get-item-grid-classes';

import { ProductCard } from '@/widgets/Catalog/components/ProductGrid/components/ProductCard';

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
    return <EmptyPlaceholder>{emptyText}</EmptyPlaceholder>;
  }

  if (isLoading && !items.length) {
    return (
      <SkeletonLoader
        variant="card"
        layout="grid"
        count={initialChunkSize}
        className={getItemGridClasses()}
        ariaLabel="Загружаем товары"
      />
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
        <SkeletonLoader
          variant="card"
          layout="grid"
          count={chunkSize}
          className={getItemGridClasses()}
          ariaLabel="Загружаем ещё товары"
        />
      )}

      {!hasMore && items.length > 0 && (
        <div className="text-center py-8 text-sm text-muted-foreground">
          Показаны все товары
        </div>
      )}
    </div>
  );
}
