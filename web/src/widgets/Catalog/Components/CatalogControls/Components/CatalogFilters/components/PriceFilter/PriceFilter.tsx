import { Input } from '@/components/ui/Input';
import { cn } from '@/shared/utils/cn';

import type { CatalogPriceFilterValue } from '../../types/catalog-filters';

type PriceFilterProps = {
  value: CatalogPriceFilterValue;
  min: number;
  max: number;
  onChange: (value: CatalogPriceFilterValue) => void;
};

export function PriceFilter({ value, min, max, onChange }: PriceFilterProps) {
  const isDisabled = min === max;

  function normalizeRange(nextValue: CatalogPriceFilterValue) {
    const from = Math.max(min, Math.min(nextValue.from, max));
    const to = Math.max(min, Math.min(nextValue.to, max));

    return {
      from: Math.min(from, to),
      to: Math.max(from, to),
    };
  }

  function updateFrom(from: number) {
    onChange(normalizeRange({ ...value, from }));
  }

  function updateTo(to: number) {
    onChange(normalizeRange({ ...value, to }));
  }

  const leftPercent =
    max === min ? 0 : ((value.from - min) / (max - min)) * 100;

  const rightPercent =
    max === min ? 100 : ((value.to - min) / (max - min)) * 100;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <label className="space-y-1">
          <span className="text-xs text-muted-foreground">От</span>
          <div className="h-9 rounded-lg bg-background px-3">
            <Input
              type="number"
              value={value.from}
              min={min}
              max={max}
              disabled={isDisabled}
              onChange={(event) => updateFrom(Number(event.target.value))}
            />
          </div>
        </label>

        <label className="space-y-1">
          <span className="text-xs text-muted-foreground">До</span>
          <div className="h-9 rounded-lg bg-background px-3">
            <Input
              type="number"
              value={value.to}
              min={min}
              max={max}
              disabled={isDisabled}
              onChange={(event) => updateTo(Number(event.target.value))}
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
          value={value.from}
          disabled={isDisabled}
          className={cn(
            'pointer-events-none absolute inset-x-0 top-0 h-6 w-full appearance-none bg-transparent',
            '[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground',
          )}
          onChange={(event) => updateFrom(Number(event.target.value))}
        />

        <input
          type="range"
          min={min}
          max={max}
          value={value.to}
          disabled={isDisabled}
          className={cn(
            'pointer-events-none absolute inset-x-0 top-0 h-6 w-full appearance-none bg-transparent',
            '[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground',
          )}
          onChange={(event) => updateTo(Number(event.target.value))}
        />
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{min.toLocaleString('ru-RU')} ₽</span>
        <span>{max.toLocaleString('ru-RU')} ₽</span>
      </div>
    </div>
  );
}