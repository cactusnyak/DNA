import { X } from 'lucide-react';

import { Button } from '@/components/ui/Button';

import type {
  CatalogSortOption,
  CatalogSortRule,
} from '../../types/catalog-sorting';

type SortRuleListProps = {
  options: CatalogSortOption[];
  rules: CatalogSortRule[];
  onRemoveRule: (ruleId: string) => void;
  onClear: () => void;
};

export function SortRuleList({
  options,
  rules,
  onRemoveRule,
  onClear,
}: SortRuleListProps) {
  if (!rules.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Сортировка отключена.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {rules.map((rule, index) => {
          const option = options.find((item) => item.field === rule.field);
          const directionLabel =
            rule.direction === 'asc'
              ? option?.ascLabel
              : option?.descLabel;

          return (
            <div
              key={rule.id}
              className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs"
            >
              <span className="text-muted-foreground">{index + 1}</span>
              <span>{option?.label ?? rule.field}</span>
              <span className="text-muted-foreground">{directionLabel}</span>

              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => onRemoveRule(rule.id)}
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