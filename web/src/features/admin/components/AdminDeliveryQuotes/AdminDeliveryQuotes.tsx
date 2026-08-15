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

const STATUS_VARIANTS: Record<
  DeliveryQuoteStatus,
  { label: string; variant: 'primary' | 'success' | 'warning' | 'dangerous' | 'destructive' }
> = {
  'PENDING': { label: 'Новая', variant: 'warning' },
  'QUOTED': { label: 'Оценена', variant: 'primary' },
  'ACCEPTED': { label: 'Оценена', variant: 'success' },
  'EXPIRED': { label: 'Истекла', variant: 'dangerous' },
  'CANCELLED': { label: 'Отменена', variant: 'destructive' },
};

function StatusBadge({ status }: { status: DeliveryQuoteStatus }) {
  const config = STATUS_VARIANTS[status];

  return (
    <span className={`w-fit rounded-sm bg-${config.variant}/5 px-2 py-1 text-xs text-${config.variant} underline-offset-4 hover:bg-${config.variant}/10`}>
      {config.label}
    </span>
  );
}

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
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">Расчёты крупногабаритной доставки</h2>
      </div>

      {!query.data?.length && (
        <p className="text-sm text-muted-foreground">Заявок пока нет.</p>
      )}

      <div className="flex flex-col gap-4">
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
              className="flex flex-col gap-4 rounded-xl border border-border/80 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <div className="font-medium">
                    {quote.product.title} · {quote.quantity} шт.
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {quote.destinationRegion}, {quote.destinationCity},{' '}
                    {quote.destinationAddress}
                  </div>
                </div>
                <StatusBadge status={quote.status} />
              </div>

              <div className="rounded-lg bg-muted/30 px-4 py-3 text-sm">
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <span className="font-medium">{quote.customerName}</span>
                  <span>{quote.customerPhone}</span>
                  {quote.customerEmail && <span>{quote.customerEmail}</span>}
                </div>
                {quote.customerComment && (
                  <div className="mt-1 text-muted-foreground">
                    Комментарий: {quote.customerComment}
                  </div>
                )}
              </div>

              {quote.confirmedDeliveryPrice != null && (
                <div className="rounded-lg bg-primary/5 px-4 py-2 text-sm">
                  <span className="font-medium">Текущая цена:</span>{' '}
                  {formatPrice(quote.confirmedDeliveryPrice)}
                </div>
              )}

              <div className="flex flex-col gap-3 border-t border-border/60 pt-4">
                <div className="text-sm font-medium text-muted-foreground">
                  Редактирование предложения
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <FormInputField
                    name={`price-${quote.id}`}
                    label="Цена доставки, ₽"
                    type="number"
                    min={0}
                    value={draft.price}
                    onChange={(event) => update({ price: event.target.value })}
                  />

                  <FormInputField
                    name={`expires-${quote.id}`}
                    label="Действует до"
                    type="datetime-local"
                    value={draft.expiresAt}
                    onChange={(event) => update({ expiresAt: event.target.value })}
                  />
                </div>

                <FormTextareaField
                  name={`comment-${quote.id}`}
                  label="Комментарий менеджера"
                  rows={3}
                  value={draft.comment}
                  onChange={(event) => update({ comment: event.target.value })}
                />
              </div>

              <div className="flex flex-wrap gap-2 border-t border-border/60 pt-4">
                <Button
                  type="button"
                  variant="accent"
                  onClick={() => mutation.mutate({ id: quote.id, status: 'QUOTED' })}
                >
                  Подтвердить цену
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => mutation.mutate({ id: quote.id, status: 'EXPIRED' })}
                >
                  Пометить истёкшим
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => mutation.mutate({ id: quote.id, status: 'CANCELLED' })}
                >
                  Отменить
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}