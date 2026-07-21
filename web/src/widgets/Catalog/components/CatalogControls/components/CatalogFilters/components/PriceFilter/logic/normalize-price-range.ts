import type { CatalogPriceFilterValue } from '../../../types/catalog-filters';

export function normalizePriceRange(
  value: CatalogPriceFilterValue,
  min: number,
  max: number,
): CatalogPriceFilterValue {
  const from = Math.max(min, Math.min(value.from, max));
  const to = Math.max(min, Math.min(value.to, max));

  return {
    from: Math.min(from, to),
    to: Math.max(from, to),
  };
}