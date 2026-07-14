import { getFeed } from '@/entities/feed';
import type { FeedItem } from '@/entities/feed';
import { useFeedChunkSize } from '@/shared/hooks/use-feed-chunk-size';
import { usePageScrollLazyLoading } from '@/shared/hooks/use-page-scroll-lazy-loading';
import { PLATFORM_SECTION } from '@/shared/platform';
import { getItemGridClasses } from '@/shared/utils/get-item-grid-classes';
import { AdCard } from '@/widgets/AdsListing/components/AdCard';
import { ProductCard } from '@/widgets/Catalog/components/ProductGrid/components/ProductCard/ProductCard';

function CardSkeleton() {
  return (
    <div className="flex flex-col bg-card border border-border rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-square bg-muted" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-muted rounded" />
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-6 bg-muted rounded w-20 mt-2" />
      </div>
    </div>
  );
}

export function CombinedFeed() {
  const { initialChunkSize, chunkSize } = useFeedChunkSize('default');

  const { items, isLoading, hasMore, error } = usePageScrollLazyLoading<FeedItem>({
    fetchFunction: getFeed,
    initialChunkSize,
    chunkSize,
  });

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/20 p-5">
        <p className="text-sm text-destructive">Не удалось загрузить ленту: {error}</p>
      </div>
    );
  }

  if (isLoading && items.length === 0) {
    return (
      <div className={getItemGridClasses()}>
        {Array.from({ length: initialChunkSize }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!isLoading && items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        Товаров и объявлений пока нет.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={getItemGridClasses()}>
        {items.map((item) =>
          item.type === 'PRODUCT' ? (
            <ProductCard
              key={`product-${item.product.id}`}
              section={PLATFORM_SECTION.MARKET}
              product={item.product}
              showAddToCartButton
              showBuyNowButton
            />
          ) : (
            <AdCard key={`ad-${item.ad.id}`} ad={item.ad} />
          ),
        )}
      </div>

      {isLoading && items.length > 0 && (
        <div className={getItemGridClasses()}>
          {Array.from({ length: chunkSize }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}

      {!hasMore && items.length > 0 && (
        <div className="text-center py-8 text-sm text-muted-foreground">
          Показаны все товары и объявления
        </div>
      )}
    </div>
  );
}
