import { Button } from '@/components/ui/Button';

import type {
  CatalogSortDirection,
  CatalogSortOption,
  CatalogSortRule,
} from '../../types/catalog-sorting';

type SortRuleBuilderProps = {
  options: CatalogSortOption[];
  rules: CatalogSortRule[];
  onAddRule: (rule: CatalogSortRule) => void;
};

function getDirectionLabel(direction: CatalogSortDirection) {
  return direction === 'asc' ? 'По возрастанию' : 'По убыванию';
}

export function SortRuleBuilder({
  options,
  rules,
  onAddRule,
}: SortRuleBuilderProps) {
  function handleAddRule(
    field: CatalogSortRule['field'],
    direction: CatalogSortDirection,
  ) {
    onAddRule({
      field,
      direction,
    });
  }

  return (
    <details className="relative">
      <summary className="flex h-10 cursor-pointer list-none items-center justify-between rounded-lg border border-border bg-background px-3 text-sm">
        Добавить сортировку
        <span className="text-muted-foreground">ORDER BY</span>
      </summary>

      <div className="absolute right-0 z-30 mt-2 w-80 space-y-2 rounded-lg border border-border bg-background p-3 shadow-lg">
        {options.map((option) => {
          const isFieldUsed = rules.some((rule) => rule.field === option.field);

          return (
            <div
              key={option.field}
              className="space-y-2 rounded-md border border-border p-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{option.label}</span>

                {isFieldUsed && (
                  <span className="text-xs text-muted-foreground">
                    уже выбрано
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isFieldUsed}
                  onClick={() => handleAddRule(option.field, 'asc')}
                >
                  {getDirectionLabel('asc')}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isFieldUsed}
                  onClick={() => handleAddRule(option.field, 'desc')}
                >
                  {getDirectionLabel('desc')}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </details>
  );
}