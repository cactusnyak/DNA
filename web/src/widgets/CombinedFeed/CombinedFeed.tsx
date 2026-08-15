import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { getFeed } from '@/entities/feed';
import type { FeedItem } from '@/entities/feed';
import { EmptyPlaceholder } from '@/components/ui/EmptyPlaceholder';
import { ListEndMessage } from '@/components/ui/ListEndMessage';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { useFeedChunkSize } from '@/shared/hooks/use-feed-chunk-size';
import { usePageScrollLazyLoading } from '@/shared/hooks/use-page-scroll-lazy-loading';
import { PLATFORM_SECTION } from '@/shared/platform';
import { getItemGridClasses } from '@/shared/utils/get-item-grid-classes';
import { AdCard } from '@/widgets/AdsListing/components/AdCard';
import { ProductCard } from '@/widgets/Catalog/components/ProductGrid/components/ProductCard/ProductCard';

type CombinedItemsGridProps = {
  items: FeedItem[];
  compact?: boolean;
};

export function CombinedItemsGrid({
  items,
  compact = false,
}: CombinedItemsGridProps) {
  return (
    <div className={getItemGridClasses(compact ? 'compact' : 'default')}>
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
        <ErrorMessage>Не удалось загрузить ленту: {error}</ErrorMessage>
      </div>
    );
  }

  if (isLoading && items.length === 0) {
    return (
      <SkeletonLoader
        variant="card"
        layout="grid"
        count={initialChunkSize}
        className={getItemGridClasses()}
        ariaLabel="Загружаем товары и объявления"
      />
    );
  }

  if (!isLoading && items.length === 0) {
    return <EmptyPlaceholder>Товаров и объявлений пока нет.</EmptyPlaceholder>;
  }

  return (
    <div className="space-y-4">
      <CombinedItemsGrid items={items} />

      {isLoading && items.length > 0 && (
        <SkeletonLoader
          variant="card"
          layout="grid"
          count={chunkSize}
          className={getItemGridClasses()}
          ariaLabel="Загружаем ещё элементы"
        />
      )}

      {!hasMore && items.length > 0 && (
        <ListEndMessage>Показаны все товары и объявления</ListEndMessage>
      )}
    </div>
  );
}
