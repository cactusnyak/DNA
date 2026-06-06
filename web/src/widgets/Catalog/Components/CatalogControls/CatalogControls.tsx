import { CatalogFilters } from './Components/CatalogFilters';
import { CatalogSorting } from './Components/CatalogSorting';

type CatalogControlsProps = {
  showFilters?: boolean;
  showSorting?: boolean;
};

export function CatalogControls({
  showFilters = true,
  showSorting = true,
}: CatalogControlsProps) {
  if (!showFilters && !showSorting) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg bg-card lg:flex-row lg:items-center lg:justify-between">
      {showFilters && <CatalogFilters />}
      {showSorting && <CatalogSorting />}
    </div>
  );
}