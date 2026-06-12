import { ArrowDown, ArrowUp } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';

import { catalogSortOptions } from './data/catalog-sort-options';
import type {
  CatalogSortDirection,
  CatalogSortField,
  CatalogSortRule,
} from './types/catalog-sorting';

type CatalogSortingProps = {
  value: CatalogSortRule[];
  onChange: (value: CatalogSortRule[]) => void;
};

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

export function CatalogSorting({ value, onChange }: CatalogSortingProps) {
  function getRuleDirection(field: CatalogSortField) {
    return value.find((rule) => rule.field === field)?.direction;
  }

  function handleToggleSort(field: CatalogSortField) {
    const currentRule = value.find((rule) => rule.field === field);
    const nextDirection = getNextSortDirection(currentRule?.direction);

    const rulesWithoutCurrentField = value.filter(
      (rule) => rule.field !== field,
    );

    if (!nextDirection) {
      onChange(rulesWithoutCurrentField);
      return;
    }

    onChange([
      ...rulesWithoutCurrentField,
      {
        field,
        direction: nextDirection,
      },
    ]);
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">Сортировка</h2>

        {value.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange([])}
          >
            Сбросить
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {catalogSortOptions.map((option) => {
          const direction = getRuleDirection(option.field);

          return (
            <Chip
              key={option.field}
              active={Boolean(direction)}
              onClick={() => handleToggleSort(option.field)}
            >
              <span>{option.label}</span>

              {direction === 'asc' && <ArrowUp className="size-3.5" />}
              {direction === 'desc' && <ArrowDown className="size-3.5" />}
            </Chip>
          );
        })}
      </div>
    </section>
  );
}