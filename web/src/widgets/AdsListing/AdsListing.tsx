import { getAds } from '@/entities/ad';
import type { Ad } from '@/entities/ad';
import { EmptyPlaceholder } from '@/components/ui/EmptyPlaceholder';
import { ListEndMessage } from '@/components/ui/ListEndMessage';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { useGridColumns } from '@/shared/hooks/use-grid-columns';
import { usePageScrollLazyLoading } from '@/shared/hooks/use-page-scroll-lazy-loading';
import { getItemGridClasses } from '@/shared/utils/get-item-grid-classes';

import { AdCard } from './components/AdCard';

type AdsListingProps = {
  categorySlug?: string;
  emptyText?: string;
  ads?: Ad[];
  compact?: boolean;
};

function AdGrid({ ads, emptyText, categorySlug, compact = false }: { ads: Ad[]; emptyText: string; categorySlug?: string; compact?: boolean }) {
  if (!ads.length) {
    return <EmptyPlaceholder>{emptyText}</EmptyPlaceholder>;
  }
  return (
    <div className={getItemGridClasses(compact ? 'compact' : 'default')}>
      {ads.map((ad) => (
        <AdCard key={ad.id} ad={ad} currentCategorySlug={categorySlug} />
      ))}
    </div>
  );
}

function AdsListingFetched({
  categorySlug,
  emptyText,
  initialChunkSize,
  chunkSize,
  compact = false,
}: {
  categorySlug?: string;
  emptyText: string;
  initialChunkSize: number;
  chunkSize: number;
  compact?: boolean;
}) {
  const { items, isLoading, hasMore, error } = usePageScrollLazyLoading({
    fetchFunction: () => getAds({ categorySlug, sort: 'createdAt:desc' }),
    initialChunkSize,
    chunkSize,
  });

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/20 p-5">
        <p className="text-sm text-destructive">Не удалось загрузить объявления: {error}</p>
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
        className={getItemGridClasses(compact ? 'compact' : 'default')}
        ariaLabel="Загружаем объявления"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className={getItemGridClasses(compact ? 'compact' : 'default')}>
        {items.map((ad) => (
          <AdCard key={ad.id} ad={ad} currentCategorySlug={categorySlug} />
        ))}
      </div>

      {isLoading && items.length > 0 && (
        <SkeletonLoader
          variant="card"
          layout="grid"
          count={chunkSize}
          className={getItemGridClasses(compact ? 'compact' : 'default')}
          ariaLabel="Загружаем ещё объявления"
        />
      )}

      {!hasMore && items.length > 0 && (
        <ListEndMessage>Показаны все объявления</ListEndMessage>
      )}
    </div>
  );
}

export function AdsListing({
  categorySlug,
  emptyText = 'Объявления пока не размещены.',
  ads: externalAds,
  compact = false,
}: AdsListingProps) {
  const columns = useGridColumns(compact ? 'compact' : 'default');
  const chunkSize = columns * 2;
  const initialChunkSize = columns * 3;

  if (externalAds !== undefined) {
    return <AdGrid ads={externalAds} emptyText={emptyText} categorySlug={categorySlug} compact={compact} />;
  }

  return (
    <AdsListingFetched
      categorySlug={categorySlug}
      emptyText={emptyText}
      initialChunkSize={initialChunkSize}
      chunkSize={chunkSize}
      compact={compact}
    />
  );
}
