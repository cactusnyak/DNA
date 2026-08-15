import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { AdminDeliveryQuoteCard } from './components/AdminDeliveryQuoteCard';
import { useAdminDeliveryQuotes } from './logic/use-admin-delivery-quotes';
import type { AdminDeliveryQuotesProps } from './types/admin-delivery-quotes';

export function AdminDeliveryQuotes({ accessToken }: AdminDeliveryQuotesProps) {
  const { drafts, query, updateDraft, updateQuote } = useAdminDeliveryQuotes(accessToken);

  if (query.isPending) return <p className="text-sm text-muted-foreground">Загружаем заявки…</p>;
  if (query.isError) return <ErrorMessage>Не удалось загрузить заявки на доставку.</ErrorMessage>;

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Расчёты крупногабаритной доставки</h2>
      {!query.data?.length && <p className="text-sm text-muted-foreground">Заявок пока нет.</p>}
      <div className="flex flex-wrap items-start gap-4">
        {query.data?.map((quote) => (
          <AdminDeliveryQuoteCard
            key={quote.id}
            quote={quote}
            draft={drafts[quote.id]}
            onDraftChange={(draft) => updateDraft(quote, draft)}
            onStatusChange={(status) => updateQuote({ id: quote.id, status })}
          />
        ))}
      </div>
    </section>
  );
}
