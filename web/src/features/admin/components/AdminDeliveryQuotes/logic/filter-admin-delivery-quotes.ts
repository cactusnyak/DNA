import type {
  AdminDeliveryQuotesDateRange,
  AdminQuote,
} from '../types/admin-delivery-quotes';

type FilterAdminDeliveryQuotesOptions = {
  dateRange: AdminDeliveryQuotesDateRange;
  hiddenQuoteIds: Set<string>;
  showHiddenQuotes: boolean;
};

export function filterAdminDeliveryQuotes(
  quotes: AdminQuote[],
  {
    dateRange,
    hiddenQuoteIds,
    showHiddenQuotes,
  }: FilterAdminDeliveryQuotesOptions,
) {
  return quotes.filter((quote) => {
    const createdDate = quote.createdAt.slice(0, 10);
    const isWithinDateRange =
      (!dateRange.from || createdDate >= dateRange.from) &&
      (!dateRange.to || createdDate <= dateRange.to);
    const isVisible =
      showHiddenQuotes || !hiddenQuoteIds.has(quote.id);

    return isWithinDateRange && isVisible;
  });
}
