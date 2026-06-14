import { X } from 'lucide-react';

import { Button } from '@/components/ui/Button';

import type {
  CatalogSortOption,
  CatalogSortRule,
} from '../../types/catalog-sorting';

type SortRuleListProps = {
  options: CatalogSortOption[];
  rules: CatalogSortRule[];
  onRemoveRule: (field: CatalogSortRule['field']) => void;
  onClear: () => void;
};

function getDirectionLabel(direction: CatalogSortRule['direction']) {
  return direction === 'asc' ? 'По возрастанию' : 'По убыванию';
}

export function SortRuleList({
  options,
  rules,
  onRemoveRule,
  onClear,
}: SortRuleListProps) {
  if (!rules.length) {
    return <p className="text-sm text-muted-foreground">Сортировка отключена.</p>;
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {rules.map((rule, index) => {
          const option = options.find((item) => item.field === rule.field);

          return (
            <div
              key={rule.field}
              className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs"
            >
              <span className="text-muted-foreground">{index + 1}</span>
              <span>{option?.label ?? rule.field}</span>
              <span className="text-muted-foreground">
                {getDirectionLabel(rule.direction)}
              </span>

              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => onRemoveRule(rule.field)}
              >
                <X className="size-3" />
              </button>
            </div>
          );
        })}
      </div>

      <Button type="button" variant="ghost" size="sm" onClick={onClear}>
        Отключить сортировку
      </Button>
    </div>
  );
}