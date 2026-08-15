import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { AdminDeliveryQuoteCard } from './components/AdminDeliveryQuoteCard';
import { AdminDeliveryQuotesFilters } from './components/AdminDeliveryQuotesFilters';
import { useAdminDeliveryQuotes } from './logic/use-admin-delivery-quotes';
import { useAdminDeliveryQuotesFilters } from './logic/use-admin-delivery-quotes-filters';
import type { AdminDeliveryQuotesProps } from './types/admin-delivery-quotes';

export function AdminDeliveryQuotes({ accessToken }: AdminDeliveryQuotesProps) {
  const { drafts, query, updateDraft, updateQuote } = useAdminDeliveryQuotes(accessToken);
  const quotes = query.data ?? [];
  const {
    dateRange,
    hiddenQuoteIds,
    showHiddenQuotes,
    visibleQuotes,
    hasActiveDateRange,
    setDateRange,
    resetDateRange,
    toggleHiddenQuotes,
    toggleQuoteVisibility,
  } = useAdminDeliveryQuotesFilters(quotes);

  if (query.isPending) return <p className="text-sm text-muted-foreground">Загружаем заявки…</p>;
  if (query.isError) return <ErrorMessage>Не удалось загрузить заявки на доставку.</ErrorMessage>;

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Расчёты крупногабаритной доставки</h2>

      {quotes.length > 0 && (
        <AdminDeliveryQuotesFilters
          dateRange={dateRange}
          hasActiveDateRange={hasActiveDateRange}
          showHiddenQuotes={showHiddenQuotes}
          hiddenQuotesCount={hiddenQuoteIds.size}
          onDateRangeChange={setDateRange}
          onDateRangeReset={resetDateRange}
          onHiddenQuotesToggle={toggleHiddenQuotes}
        />
      )}

      {!quotes.length && (
        <p className="text-sm text-muted-foreground">Заявок пока нет.</p>
      )}

      {quotes.length > 0 && !visibleQuotes.length && (
        <p className="text-sm text-muted-foreground">
          По выбранным фильтрам заявок нет.
        </p>
      )}

      <div className="flex flex-wrap gap-4">
        {visibleQuotes.map((quote) => (
          <AdminDeliveryQuoteCard
            key={quote.id}
            quote={quote}
            draft={drafts[quote.id]}
            isHidden={hiddenQuoteIds.has(quote.id)}
            onDraftChange={(draft) => updateDraft(quote, draft)}
            onStatusChange={(status) => updateQuote({ id: quote.id, status })}
            onVisibilityToggle={() => toggleQuoteVisibility(quote.id)}
          />
        ))}
      </div>
    </section>
  );
}
