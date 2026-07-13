import { useNavigate } from 'react-router-dom';

import { getProducts } from '@/entities/product/api/get-products';
import { ProductCard } from '@/widgets/Catalog/components/ProductGrid/components/ProductCard/ProductCard';
import { HorizontalScrollSection } from '@/widgets/HorizontalScrollSection';
import { useHorizontalScrollLazyLoading } from '@/shared/hooks/use-horizontal-scroll-lazy-loading';
import { PLATFORM_SECTION } from '@/shared/platform';

type LatestProductsProps = {
  initialChunkSize?: number;
  chunkSize?: number;
  className?: string;
};

export function LatestProducts({
  initialChunkSize = 8,
  chunkSize = 4,
  className,
}: LatestProductsProps) {
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
      const response = await getProducts({
        section: PLATFORM_SECTION.MARKET,
        sortRules: [{ field: 'title', direction: 'desc' }],
      });
      
      // Client-side pagination - sort by creation date client-side since API doesn't support it
      const sortedResponse = response.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      const start = offset;
      const end = start + limit;
      return sortedResponse.slice(start, end);
    },
    initialChunkSize,
    chunkSize,
  });

  const handleSeeAll = () => {
    navigate('/market');
  };

  if (error) {
    return (
      <HorizontalScrollSection
        title="Товары"
        className={className}
      >
        <div className="text-center text-muted-foreground py-8 w-full min-w-[280px]">
          Не удалось загрузить товары: {error}
        </div>
      </HorizontalScrollSection>
    );
  }

  return (
    <HorizontalScrollSection
      title="Товары"
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
          {items.map((product) => (
            <div key={product.id} className="min-w-0 w-72 flex-shrink-0">
              <ProductCard
                section={PLATFORM_SECTION.MARKET}
                product={product}
                showAddToCartButton={true}
                showBuyNowButton={true}
              />
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
