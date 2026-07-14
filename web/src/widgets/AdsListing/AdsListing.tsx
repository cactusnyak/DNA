import { getAds } from '@/entities/ad';
import type { Ad } from '@/entities/ad';
import { usePageScrollLazyLoading } from '@/shared/hooks/use-page-scroll-lazy-loading';

import { AdCard } from './components/AdCard';

type AdsListingProps = {
  categorySlug?: string;
  emptyText?: string;
  initialChunkSize?: number;
  chunkSize?: number;
  ads?: Ad[];
};

function AdGrid({ ads, emptyText, categorySlug }: { ads: Ad[]; emptyText: string; categorySlug?: string }) {
  if (!ads.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        {emptyText}
      </div>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
}: {
  categorySlug?: string;
  emptyText: string;
  initialChunkSize: number;
  chunkSize: number;
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
}: AdsListingProps) {
  if (externalAds !== undefined) {
    return <AdGrid ads={externalAds} emptyText={emptyText} categorySlug={categorySlug} />;
  }

  return (
    <AdsListingFetched
      categorySlug={categorySlug}
      emptyText={emptyText}
      initialChunkSize={initialChunkSize}
      chunkSize={chunkSize}
    />
  );
}
