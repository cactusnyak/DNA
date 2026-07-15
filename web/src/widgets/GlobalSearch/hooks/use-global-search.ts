import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type UIEvent,
} from 'react';
import { useQuery } from '@tanstack/react-query';

import { getCatalogCategories } from '@/shared/catalog';
import { getAds } from '@/entities/ad/api/get-ads';
import { getProducts } from '@/entities/product/api/get-products';
import { PLATFORM_SECTION } from '@/shared/platform';

import { filterGlobalSearchAds } from '../logic/filter-global-search-ads';
import { filterGlobalSearchCategories } from '../logic/filter-global-search-categories';
import { filterGlobalSearchProducts } from '../logic/filter-global-search-products';
import { filterGlobalSearchSections } from '../logic/filter-global-search-sections';
import { normalizeSearchValue } from '../logic/normalize-search-value';

const MIN_SEARCH_LENGTH = 2;
const PRODUCT_RESULTS_STEP = 8;

export function useGlobalSearch() {
  const containerRef = useRef<HTMLDivElement>(null);

  const [searchValue, setSearchValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [visibleProductsLimit, setVisibleProductsLimit] = useState(
    PRODUCT_RESULTS_STEP,
  );
  const [visibleAdsLimit, setVisibleAdsLimit] = useState(PRODUCT_RESULTS_STEP);

  const normalizedSearchValue = normalizeSearchValue(searchValue);
  const isSearchReady = normalizedSearchValue.length >= MIN_SEARCH_LENGTH;
  const isGlobalSearchEnabled = isOpen && isSearchReady;

  const {
    data: marketCategories = [],
    isPending: isMarketCategoriesPending,
    isError: isMarketCategoriesError,
  } = useQuery({
    queryKey: ['global-search-categories', PLATFORM_SECTION.MARKET],
    queryFn: () => getCatalogCategories({ section: PLATFORM_SECTION.MARKET }),
    enabled: isGlobalSearchEnabled,
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: adsCategories = [],
    isPending: isAdsCategoriesPending,
    isError: isAdsCategoriesError,
  } = useQuery({
    queryKey: ['global-search-categories', PLATFORM_SECTION.ADS],
    queryFn: () => getCatalogCategories({ section: PLATFORM_SECTION.ADS }),
    enabled: isGlobalSearchEnabled,
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: products = [],
    isPending: isProductsPending,
    isError: isProductsError,
  } = useQuery({
    queryKey: ['global-search-products'],
    queryFn: () => getProducts({ section: PLATFORM_SECTION.MARKET }),
    enabled: isGlobalSearchEnabled,
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: ads = [],
    isPending: isAdsPending,
    isError: isAdsError,
  } = useQuery({
    queryKey: ['global-search-ads'],
    queryFn: () => getAds(),
    enabled: isGlobalSearchEnabled,
    staleTime: 1000 * 60 * 5,
  });

  const sectionResults = useMemo(() => {
    if (!isSearchReady) {
      return [];
    }

    return filterGlobalSearchSections(searchValue);
  }, [isSearchReady, searchValue]);

  const marketCategoryResults = useMemo(() => {
    if (!isSearchReady) {
      return [];
    }

    return filterGlobalSearchCategories(marketCategories, searchValue);
  }, [marketCategories, isSearchReady, searchValue]);

  const adsCategoryResults = useMemo(() => {
    if (!isSearchReady) {
      return [];
    }

    return filterGlobalSearchCategories(adsCategories, searchValue);
  }, [adsCategories, isSearchReady, searchValue]);

  const productResults = useMemo(() => {
    if (!isSearchReady) {
      return [];
    }

    return filterGlobalSearchProducts(products, searchValue);
  }, [isSearchReady, products, searchValue]);

  const adResults = useMemo(() => {
    if (!isSearchReady) {
      return [];
    }

    return filterGlobalSearchAds(ads, searchValue);
  }, [ads, isSearchReady, searchValue]);

  const visibleAds = adResults.slice(0, visibleAdsLimit);
  const hasMoreAds = visibleAdsLimit < adResults.length;

  const visibleProducts = productResults.slice(0, visibleProductsLimit);
  const hasMoreProducts = visibleProductsLimit < productResults.length;

  function openSearch() {
    setIsOpen(true);
  }

  function closeSearch() {
    setIsOpen(false);
  }

  function handleResultClick() {
    setIsOpen(false);
    setSearchValue('');
  }

  function handleProductResultsScroll(event: UIEvent<HTMLDivElement>) {
    const element = event.currentTarget;
    const distanceToBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight;

    if (distanceToBottom > 32 || !hasMoreProducts) {
      return;
    }

    setVisibleProductsLimit((currentLimit) =>
      Math.min(currentLimit + PRODUCT_RESULTS_STEP, productResults.length),
    );
  }

  function handleAdResultsScroll(event: UIEvent<HTMLDivElement>) {
    const element = event.currentTarget;
    const distanceToBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight;

    if (distanceToBottom > 32 || !hasMoreAds) {
      return;
    }

    setVisibleAdsLimit((currentLimit) =>
      Math.min(currentLimit + PRODUCT_RESULTS_STEP, adResults.length),
    );
  }

  useEffect(() => {
    setVisibleProductsLimit(PRODUCT_RESULTS_STEP);
    setVisibleAdsLimit(PRODUCT_RESULTS_STEP);
  }, [normalizedSearchValue]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (containerRef.current?.contains(target)) {
        return;
      }

      closeSearch();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeSearch();
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return {
    containerRef,
    searchValue,
    isOpen,
    isSearchReady,

    sectionResults,

    marketCategories,
    adsCategories,
    marketCategoryResults,
    adsCategoryResults,
    isMarketCategoriesPending,
    isAdsCategoriesPending,
    isMarketCategoriesError,
    isAdsCategoriesError,

    productResults,
    visibleProducts,
    hasMoreProducts,
    isProductsPending,
    isProductsError,

    adResults,
    visibleAds,
    hasMoreAds,
    isAdsPending,
    isAdsError,

    setSearchValue,
    openSearch,
    closeSearch,
    handleResultClick,
    handleProductResultsScroll,
    handleAdResultsScroll,
  };
}

