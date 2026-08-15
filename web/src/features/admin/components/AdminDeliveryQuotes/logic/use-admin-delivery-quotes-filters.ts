import { useMemo, useState } from 'react';
import type {
  AdminDeliveryQuotesDateRange,
  AdminQuote,
} from '../types/admin-delivery-quotes';
import { filterAdminDeliveryQuotes } from './filter-admin-delivery-quotes';

const EMPTY_DATE_RANGE: AdminDeliveryQuotesDateRange = {
  from: '',
  to: '',
};

export function useAdminDeliveryQuotesFilters(quotes: AdminQuote[]) {
  const [dateRange, setDateRange] =
    useState<AdminDeliveryQuotesDateRange>(EMPTY_DATE_RANGE);
  const [hiddenQuoteIds, setHiddenQuoteIds] = useState<Set<string>>(
    new Set(),
  );
  const [showHiddenQuotes, setShowHiddenQuotes] = useState(false);

  const visibleQuotes = useMemo(
    () =>
      filterAdminDeliveryQuotes(quotes, {
        dateRange,
        hiddenQuoteIds,
        showHiddenQuotes,
      }),
    [dateRange, hiddenQuoteIds, quotes, showHiddenQuotes],
  );

  const toggleQuoteVisibility = (quoteId: string) => {
    setHiddenQuoteIds((current) => {
      const next = new Set(current);

      if (next.has(quoteId)) {
        next.delete(quoteId);
      } else {
        next.add(quoteId);
      }

      return next;
    });
  };

  return {
    dateRange,
    hiddenQuoteIds,
    showHiddenQuotes,
    visibleQuotes,
    hasActiveDateRange: Boolean(dateRange.from || dateRange.to),
    setDateRange,
    resetDateRange: () => setDateRange(EMPTY_DATE_RANGE),
    toggleHiddenQuotes: () => setShowHiddenQuotes((current) => !current),
    toggleQuoteVisibility,
  };
}
