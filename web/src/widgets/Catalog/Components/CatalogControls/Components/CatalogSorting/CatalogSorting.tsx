import { ArrowDown, ArrowUp } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/shared/utils/cn';

import { catalogSortOptions } from './data/catalog-sort-options';
import type {
  CatalogSortDirection,
  CatalogSortField,
  CatalogSortRule,
} from './types/catalog-sorting';

function getNextSortDirection(
  currentDirection?: CatalogSortDirection,
): CatalogSortDirection | undefined {
  if (!currentDirection) {
    return 'asc';
  }

  if (currentDirection === 'asc') {
    return 'desc';
  }

  return undefined;
}

export function CatalogSorting() {
  const [sortRules, setSortRules] = useState<CatalogSortRule[]>([]);

  function getRuleDirection(field: CatalogSortField) {
    return sortRules.find((rule) => rule.field === field)?.direction;
  }

  function handleToggleSort(field: CatalogSortField) {
    setSortRules((currentRules) => {
      const currentRule = currentRules.find((rule) => rule.field === field);
      const nextDirection = getNextSortDirection(currentRule?.direction);

      const rulesWithoutCurrentField = currentRules.filter(
        (rule) => rule.field !== field,
      );

      if (!nextDirection) {
        return rulesWithoutCurrentField;
      }

      return [
        ...rulesWithoutCurrentField,
        {
          field,
          direction: nextDirection,
        },
      ];
    });
  }

  function handleClearRules() {
    setSortRules([]);
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">Сортировка</h2>

        {sortRules.length > 0 && (
          <Button type="button" variant="ghost" size="sm" onClick={handleClearRules}>
            Сбросить
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {catalogSortOptions.map((option) => {
          const direction = getRuleDirection(option.field);
          const isActive = Boolean(direction);

          return (
            <button
              key={option.field}
              type="button"
              className={cn(
                'flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm transition-colors',
                isActive
                  ? 'bg-foreground text-background'
                  : 'bg-background text-foreground hover:bg-muted',
              )}
              onClick={() => handleToggleSort(option.field)}
            >
              <span>{option.label}</span>

              {direction === 'asc' && <ArrowUp className="size-3.5" />}
              {direction === 'desc' && <ArrowDown className="size-3.5" />}
            </button>
          );
        })}
      </div>

      {sortRules.length > 1 && (
        <p className="text-xs text-muted-foreground">
          Порядок сортировки применяется слева направо.
        </p>
      )}
    </section>
  );
}