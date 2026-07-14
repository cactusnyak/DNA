import { getAds } from '@/entities/ad';
import type { Ad } from '@/entities/ad';
import { usePageScrollLazyLoading } from '@/shared/hooks/use-page-scroll-lazy-loading';
import { getItemGridClasses } from '@/shared/utils/get-item-grid-classes';

import { AdCard } from './components/AdCard';

type AdsListingProps = {
  categorySlug?: string;
  emptyText?: string;
  initialChunkSize?: number;
  chunkSize?: number;
  ads?: Ad[];
  compact?: boolean;
};

function AdGrid({ ads, emptyText, categorySlug, compact = false }: { ads: Ad[]; emptyText: string; categorySlug?: string; compact?: boolean }) {
  if (!ads.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        {emptyText}
      </div>
    );
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
    return (
      <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        {emptyText}
      </div>
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
        <div className="flex justify-center py-8">
          <div className="flex gap-2">
            {Array.from({ length: Math.min(chunkSize, 4) }).map((_, i) => (
              <div key={i} className="w-16 h-16 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      )}

      {!hasMore && items.length > 0 && (
        <div className="text-center py-8 text-sm text-muted-foreground">
          Показаны все объявления
        </div>
      )}
    </div>
  );
}

export function AdsListing({
  categorySlug,
  emptyText = 'Объявления пока не размещены.',
  initialChunkSize = 12,
  chunkSize = 12,
  ads: externalAds,
  compact = false,
}: AdsListingProps) {
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
