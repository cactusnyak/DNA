import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { httpClient } from '@/shared/api/http-client';
import { Button } from '@/components/ui/Button';
import { FormInputField, FormTextareaField } from '@/components/ui/FormField';
import { formatPrice } from '@/shared/utils/format-price';
import type { DeliveryQuote, DeliveryQuoteStatus } from '@/entities/delivery-quote';

type AdminQuote = DeliveryQuote & {
  product: { title: string };
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerComment?: string;
  accessRestrictions?: string;
  unloadingRequired: boolean;
};

export function AdminDeliveryQuotes({ accessToken }: { accessToken: string }) {
  const client = useQueryClient();
  const [drafts, setDrafts] = useState<
    Record<string, { price: string; comment: string; expiresAt: string }>
  >({});

  const headers = { Authorization: `Bearer ${accessToken}` };

  const query = useQuery({
    queryKey: ['admin-delivery-quotes'],
    queryFn: () => httpClient<AdminQuote[]>('/admin/delivery-quotes', { headers }),
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: DeliveryQuoteStatus }) => {
      const draft = drafts[id] ?? { price: '', comment: '', expiresAt: '' };
      return httpClient(`/admin/delivery-quotes/${id}`, {
        method: 'PATCH',
        headers,
        body: {
          status,
          confirmedDeliveryPrice: draft.price === '' ? undefined : Number(draft.price),
          managerComment: draft.comment,
          expiresAt: draft.expiresAt || undefined,
        },
      });
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['admin-delivery-quotes'] }),
  });

  if (query.isPending) {
    return <p className="text-sm text-muted-foreground">Загружаем заявки…</p>;
  }

  if (query.isError) {
    return <ErrorMessage>Не удалось загрузить заявки на доставку.</ErrorMessage>;
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Расчёты крупногабаритной доставки</h2>

      {!query.data?.length && (
        <p className="text-sm text-muted-foreground">Заявок пока нет.</p>
      )}

      {query.data?.map((quote) => {
        const draft = drafts[quote.id] ?? {
          price: quote.confirmedDeliveryPrice?.toString() ?? '',
          comment: quote.managerComment ?? '',
          expiresAt: quote.expiresAt?.slice(0, 16) ?? '',
        };

        const update = (next: Partial<typeof draft>) => {
          setDrafts({
            ...drafts,
            [quote.id]: { ...draft, ...next },
          });
        };

        return (
          <article
            key={quote.id}
            className="flex flex-col gap-3 rounded-xl border border-border/80 p-4"
          >
            <div className="flex flex-wrap justify-between gap-2">
              <strong>
                {quote.product.title} · {quote.quantity} шт.
              </strong>
              <span>{quote.status}</span>
            </div>

            <p className="text-sm">
              {quote.destinationRegion}, {quote.destinationCity},{' '}
              {quote.destinationAddress}
            </p>

            <p className="text-sm">
              {quote.customerName}, {quote.customerPhone}
              {quote.customerEmail ? `, ${quote.customerEmail}` : ''}
            </p>

            {quote.confirmedDeliveryPrice != null && (
              <p className="font-medium">
                Текущая цена: {formatPrice(quote.confirmedDeliveryPrice)}
              </p>
            )}

            <FormInputField
              name={`price-${quote.id}`}
              label="Цена доставки, ₽"
              type="number"
              min={0}
              value={draft.price}
              onChange={(event) => update({ price: event.target.value })}
            />

            <FormTextareaField
              name={`comment-${quote.id}`}
              label="Комментарий менеджера"
              rows={3}
              value={draft.comment}
              onChange={(event) => update({ comment: event.target.value })}
            />

            <FormInputField
              name={`expires-${quote.id}`}
              label="Действует до"
              type="datetime-local"
              value={draft.expiresAt}
              onChange={(event) => update({ expiresAt: event.target.value })}
            />

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => mutation.mutate({ id: quote.id, status: 'QUOTED' })}
              >
                Подтвердить цену
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => mutation.mutate({ id: quote.id, status: 'CANCELLED' })}
              >
                Отменить
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => mutation.mutate({ id: quote.id, status: 'EXPIRED' })}
              >
                Пометить истёкшим
              </Button>
            </div>
          </article>
        );
      })}
    </section>
  );
}