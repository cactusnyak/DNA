import { useEffect, useRef, useState } from 'react';

type UsePageScrollLazyLoadingProps<T> = {
  fetchFunction: () => Promise<T[]>;
  initialChunkSize?: number;
  chunkSize?: number;
  enabled?: boolean;
  threshold?: number;
};

export function usePageScrollLazyLoading<T>({
  fetchFunction,
  initialChunkSize = 12,
  chunkSize = 12,
  enabled = true,
  threshold = 0.9,
}: UsePageScrollLazyLoadingProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const allItemsRef = useRef<T[]>([]);
  const offsetRef = useRef(0);
  const isInitializedRef = useRef(false);
  const loadingRef = useRef(false);
  const chunkSizeRef = useRef(chunkSize);

  chunkSizeRef.current = chunkSize;

  const loadInitialItems = async () => {
    if (!enabled || isInitializedRef.current || loadingRef.current) return;

    setIsLoading(true);
    setError(null);
    loadingRef.current = true;

    try {
      const allData = await fetchFunction();
      allItemsRef.current = allData;

      const initialItems = allData.slice(0, initialChunkSize);
      setItems(initialItems);
      offsetRef.current = initialChunkSize;
      setHasMore(allData.length > initialChunkSize);
      isInitializedRef.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load items');
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  };

  const loadMoreItems = () => {
    if (!enabled || !hasMore || !isInitializedRef.current || loadingRef.current) return;

    loadingRef.current = true;
    setIsLoading(true);

    const start = offsetRef.current;
    const end = start + chunkSizeRef.current;
    const newItems = allItemsRef.current.slice(start, end);

    setItems((prev) => [...prev, ...newItems]);
    offsetRef.current = end;
    setHasMore(end < allItemsRef.current.length);

    setIsLoading(false);
    loadingRef.current = false;
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!hasMore || loadingRef.current) return;

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;

      if ((scrollTop + clientHeight) / scrollHeight > threshold) {
        loadMoreItems();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, threshold]);

  useEffect(() => {
    if (enabled) {
      loadInitialItems();
    }
  }, [enabled]);

  return {
    items,
    isLoading,
    hasMore,
    error,
    loadMoreItems,
    refetch: loadInitialItems,
  };
}
