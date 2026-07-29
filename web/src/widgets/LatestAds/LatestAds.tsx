import { useNavigate } from 'react-router-dom';

import { getAds } from '@/entities/ad/api/get-ads';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
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
        Array.from({ length: initialChunkSize }).map((_, index) => (
          <SkeletonLoader
            key={`skeleton-${index}`}
            variant="card"
            itemClassName="w-72 shrink-0"
            ariaLabel="Загружаем объявление"
          />
        ))
      ) : (
        <>
          {items.map((ad) => (
            <div key={ad.id} className="min-w-0 w-72 flex-shrink-0">
              <AdCard ad={ad} />
            </div>
          ))}
          
          {isLoading && hasMore && (
            Array.from({ length: Math.min(chunkSize, 2) }).map((_, index) => (
              <SkeletonLoader
                key={`loading-${index}`}
                variant="card"
                itemClassName="w-72 shrink-0"
                ariaLabel="Загружаем ещё объявление"
              />
            ))
          )}
        </>
      )}
    </HorizontalScrollSection>
  );
}
