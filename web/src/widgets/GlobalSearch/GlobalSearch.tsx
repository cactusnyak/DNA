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
  const {
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

    setSearchValue,
    openSearch,
    handleResultClick,
    handleProductResultsScroll,
  } = useGlobalSearch();

  function handleFocus() {
    openSearch();
    onOpen?.();
  }

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <SearchInput
        value={searchValue}
        placeholder={placeholder}
        autoComplete="off"
        className={inputClassName}
        onFocus={handleFocus}
        onChange={(event) => setSearchValue(event.target.value)}
      />

      {isOpen && (
        <GlobalSearchDropdown
          isSearchReady={isSearchReady}
          sections={sectionResults}
          categories={categoryResults}
          allCategories={categories}
          isCategoriesPending={isCategoriesPending}
          isCategoriesError={isCategoriesError}
          products={visibleProducts}
          totalProducts={productResults.length}
          isProductsPending={isProductsPending}
          isProductsError={isProductsError}
          hasMoreProducts={hasMoreProducts}
          onProductResultsScroll={handleProductResultsScroll}
          onNavigate={handleResultClick}
        />
      )}
    </div>
  );
}