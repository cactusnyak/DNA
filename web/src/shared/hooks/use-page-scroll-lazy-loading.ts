import { useEffect, useRef, useState } from 'react';

type UsePageScrollLazyLoadingProps<T> = {
  fetchFunction: () => Promise<T[]>;
  initialChunkSize?: number;
  chunkSize?: number;
  enabled?: boolean;
  threshold?: number; // How close to bottom before loading (0-1)
};

export function usePageScrollLazyLoading<T>({
  fetchFunction,
  initialChunkSize = 12,
  chunkSize = 12,
  enabled = true,
  threshold = 0.9, // Load when 90% scrolled
}: UsePageScrollLazyLoadingProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [allItems, setAllItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const offsetRef = useRef(0);
  const isInitializedRef = useRef(false);
  const loadingRef = useRef(false);

  const loadInitialItems = async () => {
    if (!enabled || isInitializedRef.current || loadingRef.current) return;
    
    setIsLoading(true);
    setError(null);
    loadingRef.current = true;
    
    try {
      const allData = await fetchFunction();
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
      loadingRef.current = false;
    }
  };

  const loadMoreItems = async () => {
    if (!enabled || isLoading || !hasMore || !isInitializedRef.current || loadingRef.current) return;
    
    setIsLoading(true);
    loadingRef.current = true;
    
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
      loadingRef.current = false;
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!hasMore || isLoading || loadingRef.current) return;

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;

      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

      if (scrollPercentage > threshold) {
        loadMoreItems();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasMore, isLoading, threshold]);

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
