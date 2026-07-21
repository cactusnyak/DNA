import { useEffect, useState } from 'react';

import type { CatalogPriceFilterValue } from '../../types/catalog-filters';

import { PriceRangeFields } from './components/PriceRangeFields';
import { PriceRangeSlider } from './components/PriceRangeSlider';
import { formatPriceFilterValue } from './logic/format-price-filter-value';
import { getRangePercent } from './logic/get-range-percent';
import { normalizePriceRange } from './logic/normalize-price-range';

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

  function normalizeValue(nextValue: CatalogPriceFilterValue) {
    return normalizePriceRange(nextValue, min, max);
  }

  function commitValue(nextValue: CatalogPriceFilterValue) {
    const normalizedValue = normalizeValue(nextValue);

    setDraftValue(normalizedValue);
    onChange(normalizedValue);
  }

  function updateDraftValue(nextValue: CatalogPriceFilterValue) {
    setDraftValue(normalizeValue(nextValue));
  }

  function commitDraftValue() {
    commitValue(draftValue);
  }

  const leftPercent = getRangePercent(draftValue.from, min, max);
  const rightPercent = max === min
    ? 100
    : getRangePercent(draftValue.to, min, max);

  return (
    <div className="space-y-4">
      <PriceRangeFields
        from={draftValue.from}
        to={draftValue.to}
        min={min}
        max={max}
        isDisabled={isDisabled}
        onFromChange={(from) =>
          commitValue({
            ...draftValue,
            from,
          })
        }
        onToChange={(to) =>
          commitValue({
            ...draftValue,
            to,
          })
        }
      />

      <PriceRangeSlider
        from={draftValue.from}
        to={draftValue.to}
        min={min}
        max={max}
        leftPercent={leftPercent}
        rightPercent={rightPercent}
        isDisabled={isDisabled}
        onFromChange={(from) =>
          updateDraftValue({
            ...draftValue,
            from,
          })
        }
        onToChange={(to) =>
          updateDraftValue({
            ...draftValue,
            to,
          })
        }
        onCommit={commitDraftValue}
      />

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatPriceFilterValue(min, currencyLabel)}</span>
        <span>{formatPriceFilterValue(max, currencyLabel)}</span>
      </div>
    </div>
  );
}