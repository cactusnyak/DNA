import { CatalogFilters } from './Components/CatalogFilters';
import { CatalogSorting } from './Components/CatalogSorting';

type CatalogControlsProps = {
  selectedCategoryId?: string;
  onCategoryChange: (categoryId?: string) => void;
  showFilters?: boolean;
  showSorting?: boolean;
};

export function CatalogControls({
  selectedCategoryId,
  onCategoryChange,
  showFilters = true,
  showSorting = true,
}: CatalogControlsProps) {
  if (!showFilters && !showSorting) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg bg-card lg:flex-row lg:items-center lg:justify-between">
      {showFilters && (
        <CatalogFilters
          selectedCategoryId={selectedCategoryId}
          onCategoryChange={onCategoryChange}
        />
      )}

      {showSorting && <CatalogSorting />}
    </div>
  );
}