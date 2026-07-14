import { useEffect, useRef, useState } from 'react';

import { getAds } from '@/entities/ad/api/get-ads';
import { getProducts } from '@/entities/product/api/get-products';
import type { Ad } from '@/entities/ad';
import type { Product } from '@/entities/product';
import { PLATFORM_SECTION } from '@/shared/platform';
import { getItemGridClasses } from '@/shared/utils/get-item-grid-classes';
import { AdCard } from '@/widgets/AdsListing/components/AdCard';
import { ProductCard } from '@/widgets/Catalog/components/ProductGrid/components/ProductCard/ProductCard';

type FeedItem =
  | { kind: 'product'; data: Product; createdAt: string }
  | { kind: 'ad'; data: Ad; createdAt: string };

type CombinedFeedProps = {
  initialChunkSize?: number;
  chunkSize?: number;
  threshold?: number;
};

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

export function CombinedFeed({
  initialChunkSize = 12,
  chunkSize = 12,
  threshold = 0.9,
}: CombinedFeedProps) {
  const [visibleItems, setVisibleItems] = useState<FeedItem[]>([]);
  const [allItems, setAllItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const offsetRef = useRef(0);
  const isInitializedRef = useRef(false);
  const loadingRef = useRef(false);

  useEffect(() => {
    if (isInitializedRef.current) return;

    const fetchAll = async () => {
      setIsLoading(true);
      loadingRef.current = true;

      try {
        const [products, ads] = await Promise.all([
          getProducts({ section: PLATFORM_SECTION.MARKET }),
          getAds({ sort: 'createdAt:desc' }),
        ]);

        const productItems: FeedItem[] = products.map((p) => ({
          kind: 'product',
          data: p,
          createdAt: p.createdAt,
        }));

        const adItems: FeedItem[] = ads.map((a) => ({
          kind: 'ad',
          data: a,
          createdAt: a.createdAt,
        }));

        const merged = [...productItems, ...adItems].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

        setAllItems(merged);
        setVisibleItems(merged.slice(0, initialChunkSize));
        offsetRef.current = initialChunkSize;
        setHasMore(merged.length > initialChunkSize);
        isInitializedRef.current = true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки');
      } finally {
        setIsLoading(false);
        loadingRef.current = false;
      }
    };

    fetchAll();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!hasMore || loadingRef.current) return;

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

      if (scrollPercentage > threshold) {
        loadingRef.current = true;
        const start = offsetRef.current;
        const end = start + chunkSize;
        const next = allItems.slice(start, end);

        setVisibleItems((prev) => [...prev, ...next]);
        offsetRef.current = end;
        setHasMore(end < allItems.length);
        loadingRef.current = false;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, allItems, chunkSize, threshold]);

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/20 p-5">
        <p className="text-sm text-destructive">Не удалось загрузить ленту: {error}</p>
      </div>
    );
  }

  if (isLoading && visibleItems.length === 0) {
    return (
      <div className={getItemGridClasses()}>
        {Array.from({ length: initialChunkSize }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!isLoading && visibleItems.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        Товаров и объявлений пока нет.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={getItemGridClasses()}>
        {visibleItems.map((item) =>
          item.kind === 'product' ? (
            <ProductCard
              key={`product-${item.data.id}`}
              section={PLATFORM_SECTION.MARKET}
              product={item.data}
              showAddToCartButton
              showBuyNowButton
            />
          ) : (
            <AdCard key={`ad-${item.data.id}`} ad={item.data} />
          ),
        )}
      </div>

      {isLoading && visibleItems.length > 0 && (
        <div className={getItemGridClasses()}>
          {Array.from({ length: Math.min(chunkSize, 4) }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}

      {!hasMore && visibleItems.length > 0 && (
        <div className="text-center py-8 text-sm text-muted-foreground">
          Показаны все товары и объявления
        </div>
      )}
    </div>
  );
}
