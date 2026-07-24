import { SearchInput } from '@/components/ui/SearchInput';
import { cn } from '@/shared/utils/cn';

import { GlobalSearchDropdown } from './components/GlobalSearchDropdown';
import { useGlobalSearch } from './hooks/use-global-search';

type GlobalSearchProps = {
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  onOpen?: () => void;
};

export function GlobalSearch({
  placeholder = 'Поиск по DNA',
  className,
  inputClassName,
  onOpen,
}: GlobalSearchProps) {
  const navigate = useNavigate();
  const {
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
    handleResultClick,
    handleProductResultsScroll,
    handleAdResultsScroll,
  } = useGlobalSearch();

  function handleFocus() {
    if (window.matchMedia('(max-width: 767px)').matches) {
      return;
    }

    openSearch();
    onOpen?.();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchValue.trim();

    if (!query) {
      return;
    }

    handleResultClick();
    navigate(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <form role="search" onSubmit={handleSubmit}>
        <SearchInput
          name="globalSearch"
          value={searchValue}
          placeholder={placeholder}
          autoComplete="off"
          enterKeyHint="search"
          className={inputClassName}
          onFocus={handleFocus}
          onChange={(event) => setSearchValue(event.target.value)}
        />
      </form>

      {isOpen && (
        <div className="hidden md:block">
          <GlobalSearchDropdown
            isSearchReady={isSearchReady}
            sections={sectionResults}
            marketCategories={marketCategories}
            adsCategories={adsCategories}
            marketCategoryResults={marketCategoryResults}
            adsCategoryResults={adsCategoryResults}
            isMarketCategoriesPending={isMarketCategoriesPending}
            isAdsCategoriesPending={isAdsCategoriesPending}
            isMarketCategoriesError={isMarketCategoriesError}
            isAdsCategoriesError={isAdsCategoriesError}
            products={visibleProducts}
            totalProducts={productResults.length}
            isProductsPending={isProductsPending}
            isProductsError={isProductsError}
            hasMoreProducts={hasMoreProducts}
            ads={visibleAds}
            totalAds={adResults.length}
            isAdsPending={isAdsPending}
            isAdsError={isAdsError}
            hasMoreAds={hasMoreAds}
            searchValue={searchValue}
            onProductResultsScroll={handleProductResultsScroll}
            onAdResultsScroll={handleAdResultsScroll}
            onNavigate={handleResultClick}
          />
        </div>
      )}
    </div>
  );
}
import { type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
