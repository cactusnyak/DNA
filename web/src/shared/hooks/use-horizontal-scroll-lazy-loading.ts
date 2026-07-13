import { useEffect, useRef, useState } from 'react';

type UseHorizontalScrollLazyLoadingProps<T> = {
  fetchFunction: (offset: number, limit: number) => Promise<T[]>;
  initialChunkSize?: number;
  chunkSize?: number;
  enabled?: boolean;
};

export function useHorizontalScrollLazyLoading<T>({
  fetchFunction,
  initialChunkSize = 8,
  chunkSize = 4,
  enabled = true,
}: UseHorizontalScrollLazyLoadingProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [allItems, setAllItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const offsetRef = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);

  const loadInitialItems = async () => {
    if (!enabled || isInitializedRef.current) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const allData = await fetchFunction(0, 1000); // Fetch a large number to get all items
      setAllItems(allData);
      
      // Show initial chunk
      const initialItems = allData.slice(0, initialChunkSize);
      setItems(initialItems);
      offsetRef.current = initialChunkSize;
      setHasMore(allData.length > initialChunkSize);
      isInitializedRef.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load items');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreItems = async () => {
    if (!enabled || isLoading || !hasMore || !isInitializedRef.current) return;
    
    setIsLoading(true);
    
    try {
      const start = offsetRef.current;
      const end = start + chunkSize;
      const newItems = allItems.slice(start, end);
      
      setItems(prev => [...prev, ...newItems]);
      offsetRef.current = end;
      setHasMore(end < allItems.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load items');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container || !hasMore || isLoading) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const scrollPercentage = (scrollLeft + clientWidth) / scrollWidth;

    // Load more when user scrolls to 80% of the content
    if (scrollPercentage > 0.8) {
      loadMoreItems();
    }
  };

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
    scrollContainerRef,
    handleScroll,
    loadMoreItems,
    refetch: loadInitialItems,
  };
}
