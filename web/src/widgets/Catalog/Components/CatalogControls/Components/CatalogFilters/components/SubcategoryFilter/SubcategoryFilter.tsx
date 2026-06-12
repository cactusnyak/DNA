import type { CatalogSubcategoryFilterOption } from '../../types/catalog-filters';

type SubcategoryFilterProps = {
  options: CatalogSubcategoryFilterOption[];
  selectedIds: string[];
  onToggle: (subcategoryId: string) => void;
};

export function SubcategoryFilter({
  options,
  selectedIds,
  onToggle,
}: SubcategoryFilterProps) {
  if (!options.length) {
    return (
      <p className="text-sm text-muted-foreground">
        В этой категории нет подкатегорий.
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {options.map((option) => {
        const isSelected = selectedIds.includes(option.id);

        return (
          <label
            key={option.id}
            className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted"
          >
            <span className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggle(option.id)}
              />
              {option.name}
            </span>

            <span className="text-xs text-muted-foreground">
              {option.productsCount}
            </span>
          </label>
        );
      })}
    </div>
  );
}