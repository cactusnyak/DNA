import { useNavigate } from 'react-router-dom';

import { getAds } from '@/entities/ad/api/get-ads';
import { AdCard } from '@/widgets/AdsListing/components/AdCard/AdCard';
import { HorizontalScrollSection } from '@/widgets/HorizontalScrollSection';
import { useHorizontalScrollLazyLoading } from '@/shared/hooks/use-horizontal-scroll-lazy-loading';

type LatestAdsProps = {
  initialChunkSize?: number;
  chunkSize?: number;
  className?: string;
};

export function LatestAds({
  initialChunkSize = 8,
  chunkSize = 4,
  className,
}: LatestAdsProps) {
  const navigate = useNavigate();

  const {
    items,
    isLoading,
    hasMore,
    error,
    scrollContainerRef,
    handleScroll,
  } = useHorizontalScrollLazyLoading({
    fetchFunction: async (offset, limit) => {
      const response = await getAds({
        sort: 'createdAt:desc',
      });
      
      // Client-side pagination
      const start = offset;
      const end = start + limit;
      return response.slice(start, end);
    },
    initialChunkSize,
    chunkSize,
  });

  const handleSeeAll = () => {
    navigate('/ads');
  };

  if (error) {
    return (
      <HorizontalScrollSection
        title="Последние объявления"
        className={className}
      >
        <div className="text-center text-muted-foreground py-8 w-full min-w-[280px]">
          Не удалось загрузить объявления: {error}
        </div>
      </HorizontalScrollSection>
    );
  }

  return (
    <HorizontalScrollSection
      title="Последние объявления"
      onSeeAllClick={handleSeeAll}
      onScroll={handleScroll}
      ref={scrollContainerRef}
      className={className}
    >
      {isLoading && items.length === 0 ? (
        // Loading skeleton
        Array.from({ length: initialChunkSize }).map((_, index) => (
          <div
            key={`skeleton-${index}`}
            className="flex flex-col bg-card border border-border rounded-xl overflow-hidden min-w-0 w-72 animate-pulse"
          >
            <div className="aspect-square bg-muted" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="flex justify-between items-center">
                <div className="h-6 bg-muted rounded w-20" />
                <div className="h-6 bg-muted rounded w-16" />
              </div>
            </div>
          </div>
        ))
      ) : (
        <>
          {items.map((ad) => (
            <div key={ad.id} className="min-w-0 w-72 flex-shrink-0">
              <AdCard ad={ad} />
            </div>
          ))}
          
          {isLoading && hasMore && (
            // Loading more indicator
            Array.from({ length: Math.min(chunkSize, 2) }).map((_, index) => (
              <div
                key={`loading-${index}`}
                className="flex flex-col bg-card border border-border rounded-xl overflow-hidden min-w-0 w-72 animate-pulse"
              >
                <div className="aspect-square bg-muted" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="flex justify-between items-center">
                    <div className="h-6 bg-muted rounded w-20" />
                    <div className="h-6 bg-muted rounded w-16" />
                  </div>
                </div>
              </div>
            ))
          )}
        </>
      )}
    </HorizontalScrollSection>
  );
}
