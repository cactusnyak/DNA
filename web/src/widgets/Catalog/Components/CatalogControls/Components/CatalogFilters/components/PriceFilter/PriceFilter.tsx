import { useEffect, useState } from 'react';

import { Input } from '@/components/ui/Input';
import { cn } from '@/shared/utils/cn';

import type { CatalogPriceFilterValue } from '../../types/catalog-filters';

type PriceFilterProps = {
  value: CatalogPriceFilterValue;
  min: number;
  max: number;
  currencyLabel?: string;
  onChange: (value: CatalogPriceFilterValue) => void;
};

export function PriceFilter({
  value,
  min,
  max,
  currencyLabel = '',
  onChange,
}: PriceFilterProps) {
  const [draftValue, setDraftValue] = useState(value);

  const isDisabled = min === max;

  useEffect(() => {
    setDraftValue(value);
  }, [value]);

  function normalizeRange(nextValue: CatalogPriceFilterValue) {
    const from = Math.max(min, Math.min(nextValue.from, max));
    const to = Math.max(min, Math.min(nextValue.to, max));

    return {
      from: Math.min(from, to),
      to: Math.max(from, to),
    };
  }

  function commitValue(nextValue: CatalogPriceFilterValue) {
    const normalizedValue = normalizeRange(nextValue);

    setDraftValue(normalizedValue);
    onChange(normalizedValue);
  }

  function updateDraftFrom(from: number) {
    setDraftValue((currentValue) =>
      normalizeRange({
        ...currentValue,
        from,
      }),
    );
  }

  function updateDraftTo(to: number) {
    setDraftValue((currentValue) =>
      normalizeRange({
        ...currentValue,
        to,
      }),
    );
  }

  function commitDraftValue() {
    commitValue(draftValue);
  }

  function formatPrice(value: number) {
    const formattedValue = value.toLocaleString('ru-RU');

    return currencyLabel
      ? `${formattedValue} ${currencyLabel}`
      : formattedValue;
  }

  const leftPercent =
    max === min ? 0 : ((draftValue.from - min) / (max - min)) * 100;

  const rightPercent =
    max === min ? 100 : ((draftValue.to - min) / (max - min)) * 100;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <label className="space-y-1">
          <span className="text-xs text-muted-foreground">От</span>
          <div className="h-9 rounded-lg border border-border bg-background px-3">
            <Input
              type="number"
              value={draftValue.from}
              min={min}
              max={max}
              disabled={isDisabled}
              onChange={(event) =>
                commitValue({
                  ...draftValue,
                  from: Number(event.target.value),
                })
              }
            />
          </div>
        </label>

        <label className="space-y-1">
          <span className="text-xs text-muted-foreground">До</span>
          <div className="h-9 rounded-lg border border-border bg-background px-3">
            <Input
              type="number"
              value={draftValue.to}
              min={min}
              max={max}
              disabled={isDisabled}
              onChange={(event) =>
                commitValue({
                  ...draftValue,
                  to: Number(event.target.value),
                })
              }
            />
          </div>
        </label>
      </div>

      <div className="relative h-6">
        <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-muted" />

        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-foreground"
          style={{
            left: `${leftPercent}%`,
            right: `${100 - rightPercent}%`,
          }}
        />

        <input
          type="range"
          min={min}
          max={max}
          value={draftValue.from}
          disabled={isDisabled}
          className={cn(
            'pointer-events-none absolute inset-x-0 top-0 h-6 w-full appearance-none bg-transparent',
            '[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground',
            '[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-foreground',
          )}
          onChange={(event) => updateDraftFrom(Number(event.target.value))}
          onMouseUp={commitDraftValue}
          onTouchEnd={commitDraftValue}
          onKeyUp={commitDraftValue}
        />

        <input
          type="range"
          min={min}
          max={max}
          value={draftValue.to}
          disabled={isDisabled}
          className={cn(
            'pointer-events-none absolute inset-x-0 top-0 h-6 w-full appearance-none bg-transparent',
            '[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground',
            '[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-foreground',
          )}
          onChange={(event) => updateDraftTo(Number(event.target.value))}
          onMouseUp={commitDraftValue}
          onTouchEnd={commitDraftValue}
          onKeyUp={commitDraftValue}
        />
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatPrice(min)}</span>
        <span>{formatPrice(max)}</span>
      </div>
    </div>
  );
}