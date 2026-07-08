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
import {
  PLATFORM_SECTION,
  type PlatformSectionId,
} from '@/shared/platform';

import { filterGlobalSearchAds } from '../logic/filter-global-search-ads';
import { filterGlobalSearchCategories } from '../logic/filter-global-search-categories';
import { filterGlobalSearchProducts } from '../logic/filter-global-search-products';
import { filterGlobalSearchSections } from '../logic/filter-global-search-sections';
import { normalizeSearchValue } from '../logic/normalize-search-value';

const MIN_SEARCH_LENGTH = 2;
const PRODUCT_RESULTS_STEP = 8;

type UseGlobalSearchParams = {
  section?: PlatformSectionId | null;
};

export function useGlobalSearch({
  section = null,
}: UseGlobalSearchParams = {}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [searchValue, setSearchValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [visibleProductsLimit, setVisibleProductsLimit] = useState(
    PRODUCT_RESULTS_STEP,
  );

  const normalizedSearchValue = normalizeSearchValue(searchValue);
  const isSearchReady = normalizedSearchValue.length >= MIN_SEARCH_LENGTH;
  const isScopedSearchEnabled = Boolean(section && isOpen && isSearchReady);
  const isMarketProductSearchEnabled =
    section === PLATFORM_SECTION.MARKET && isOpen && isSearchReady;
  const isAdsSearchEnabled =
    section === PLATFORM_SECTION.ADS && isOpen && isSearchReady;

  const {
    data: categories = [],
    isPending: isCategoriesPending,
    isError: isCategoriesError,
  } = useQuery({
    queryKey: ['global-search-categories', section],
    queryFn: () => getCatalogCategories({ section }),
    enabled: isScopedSearchEnabled,
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: products = [],
    isPending: isProductsPending,
    isError: isProductsError,
  } = useQuery({
    queryKey: ['global-search-products', section],
    queryFn: () => getProducts({ section }),
    enabled: isMarketProductSearchEnabled,
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: ads = [],
    isPending: isAdsPending,
    isError: isAdsError,
  } = useQuery({
    queryKey: ['global-search-ads'],
    queryFn: () => getAds(),
    enabled: isAdsSearchEnabled,
    staleTime: 1000 * 60 * 5,
  });

  const sectionResults = useMemo(() => {
    if (!isSearchReady) {
      return [];
    }

    return filterGlobalSearchSections(searchValue);
  }, [isSearchReady, searchValue]);

  const categoryResults = useMemo(() => {
    if (!section || !isSearchReady) {
      return [];
    }

    return filterGlobalSearchCategories(categories, searchValue);
  }, [categories, isSearchReady, searchValue, section]);

  const productResults = useMemo(() => {
    if (section !== PLATFORM_SECTION.MARKET || !isSearchReady) {
      return [];
    }

    return filterGlobalSearchProducts(products, searchValue);
  }, [isSearchReady, products, searchValue, section]);

  const adResults = useMemo(() => {
    if (section !== PLATFORM_SECTION.ADS || !isSearchReady) {
      return [];
    }

    return filterGlobalSearchAds(ads, searchValue);
  }, [ads, isSearchReady, searchValue, section]);

  const visibleAds = adResults.slice(0, visibleProductsLimit);
  const hasMoreAds = visibleProductsLimit < adResults.length;

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

  useEffect(() => {
    setVisibleProductsLimit(PRODUCT_RESULTS_STEP);
  }, [normalizedSearchValue, section]);

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

    categories,
    categoryResults,
    isCategoriesPending,
    isCategoriesError,

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
  };
}

