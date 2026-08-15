import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { AdminDeliveryQuotesDateRange } from '../../types/admin-delivery-quotes';

type AdminDeliveryQuotesFiltersProps = {
  dateRange: AdminDeliveryQuotesDateRange;
  hasActiveDateRange: boolean;
  showHiddenQuotes: boolean;
  hiddenQuotesCount: number;
  onDateRangeChange: (dateRange: AdminDeliveryQuotesDateRange) => void;
  onDateRangeReset: () => void;
  onHiddenQuotesToggle: () => void;
};

export function AdminDeliveryQuotesFilters({
  dateRange,
  hasActiveDateRange,
  showHiddenQuotes,
  hiddenQuotesCount,
  onDateRangeChange,
  onDateRangeReset,
  onHiddenQuotesToggle,
}: AdminDeliveryQuotesFiltersProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-background">
      <div className="flex flex-col gap-4 bg-muted/20 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium">Фильтры заявок</p>

          {hasActiveDateRange && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onDateRangeReset}
            >
              <RotateCcw />
              Сбросить
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground">
                Дата от
              </span>
              <Input
                name="deliveryQuotesDateFrom"
                type="date"
                className="h-9"
                value={dateRange.from}
                max={dateRange.to || undefined}
                onChange={(event) =>
                  onDateRangeChange({
                    ...dateRange,
                    from: event.target.value,
                  })
                }
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground">
                Дата до
              </span>
              <Input
                name="deliveryQuotesDateTo"
                type="date"
                className="h-9"
                value={dateRange.to}
                min={dateRange.from || undefined}
                onChange={(event) =>
                  onDateRangeChange({
                    ...dateRange,
                    to: event.target.value,
                  })
                }
              />
            </label>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={onHiddenQuotesToggle}
            disabled={!hiddenQuotesCount && !showHiddenQuotes}
          >
            {showHiddenQuotes ? 'Скрыть' : 'Показать скрытые'}
            {!showHiddenQuotes && hiddenQuotesCount > 0
              ? ` (${hiddenQuotesCount})`
              : ''}
          </Button>
        </div>
      </div>
    </div>
  );
}
