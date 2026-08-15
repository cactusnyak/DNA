import { useState, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Button } from '@/components/ui/Button';
import {
  FormInputField,
  FormTextareaField,
} from '@/components/ui/FormField';
import type {
  DeliveryQuote,
  DeliveryQuoteStatus,
} from '@/entities/delivery-quote';
import { httpClient } from '@/shared/api/http-client';
import { formatPrice } from '@/shared/utils/format-price';

type AdminQuote = DeliveryQuote & {
  product: {
    title: string;
  };
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerComment?: string;
  accessRestrictions?: string;
  unloadingRequired: boolean;
};

type InfoTableRow = {
  label: string;
  value: ReactNode;
};

type InfoTableProps = {
  title: string;
  rows: InfoTableRow[];
};

const STATUS_VARIANTS: Record<
  DeliveryQuoteStatus,
  {
    label: string;
    className: string;
  }
> = {
  PENDING: {
    label: 'Ожидает расчёта',
    className: 'bg-warning/5 text-warning hover:bg-warning/10',
  },
  QUOTED: {
    label: 'Расчёт готов',
    className: 'bg-primary/5 text-primary hover:bg-primary/10',
  },
  ACCEPTED: {
    label: 'Принято',
    className: 'bg-success/5 text-success hover:bg-success/10',
  },
  EXPIRED: {
    label: 'Срок истёк',
    className: 'bg-dangerous/5 text-dangerous hover:bg-dangerous/10',
  },
  CANCELLED: {
    label: 'Отменено',
    className:
      'bg-destructive/5 text-destructive hover:bg-destructive/10',
  },
};

function StatusBadge({ status }: { status: DeliveryQuoteStatus }) {
  const config = STATUS_VARIANTS[status];

  return (
    <span
      className={`w-fit rounded-sm px-2 py-1 text-xs underline-offset-4 transition-colors ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function InfoTable({ title, rows }: InfoTableProps) {
  return (
    <section className="flex w-fit max-w-full flex-col gap-1.5">
      <h3 className="text-sm font-medium">{title}</h3>

      <div className="w-fit max-w-full overflow-x-auto rounded-lg border border-border/80">
        <table className="table-auto border-collapse text-sm">
          <tbody className="divide-y divide-border/80">
            {rows.map(({ label, value }) => (
              <tr key={label}>
                <th
                  scope="row"
                  className="whitespace-nowrap bg-muted/15 px-2 py-1 text-left align-top font-medium text-muted-foreground"
                >
                  {label}
                </th>

                <td className="max-w-md whitespace-normal break-words px-2 py-1 align-top">
                  {value || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function AdminDeliveryQuotes({
  accessToken,
}: {
  accessToken: string;
}) {
  const client = useQueryClient();

  const [drafts, setDrafts] = useState<
    Record<
      string,
      {
        price: string;
        comment: string;
        expiresAt: string;
      }
    >
  >({});

  const headers = {
    Authorization: `Bearer ${accessToken}`,
  };

  const query = useQuery({
    queryKey: ['admin-delivery-quotes'],
    queryFn: () =>
      httpClient<AdminQuote[]>('/admin/delivery-quotes', {
        headers,
      }),
  });

  const mutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: DeliveryQuoteStatus;
    }) => {
      const draft = drafts[id] ?? {
        price: '',
        comment: '',
        expiresAt: '',
      };

      return httpClient(`/admin/delivery-quotes/${id}`, {
        method: 'PATCH',
        headers,
        body: {
          status,
          confirmedDeliveryPrice:
            draft.price === '' ? undefined : Number(draft.price),
          managerComment: draft.comment,
          expiresAt: draft.expiresAt || undefined,
        },
      });
    },
    onSuccess: () =>
      client.invalidateQueries({
        queryKey: ['admin-delivery-quotes'],
      }),
  });

  if (query.isPending) {
    return (
      <p className="text-sm text-muted-foreground">
        Загружаем заявки…
      </p>
    );
  }

  if (query.isError) {
    return (
      <ErrorMessage>
        Не удалось загрузить заявки на доставку.
      </ErrorMessage>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-xl font-semibold">
        Расчёты крупногабаритной доставки
      </h2>

      {!query.data?.length && (
        <p className="text-sm text-muted-foreground">
          Заявок пока нет.
        </p>
      )}

      <div className="flex flex-wrap items-start gap-4">
        {query.data?.map((quote) => {
          const draft = drafts[quote.id] ?? {
            price: quote.confirmedDeliveryPrice?.toString() ?? '',
            comment: quote.managerComment ?? '',
            expiresAt: quote.expiresAt?.slice(0, 16) ?? '',
          };

          const update = (next: Partial<typeof draft>) => {
            setDrafts((current) => ({
              ...current,
              [quote.id]: {
                ...draft,
                ...next,
              },
            }));
          };

          return (
            <article
              key={quote.id}
              className="flex min-w-0 flex-1 basis-[30rem] flex-col gap-7 rounded-xl border border-border/80 p-5"
            >
              <header className="flex flex-wrap items-start justify-between gap-3">
                <div className="font-medium">
                  {quote.product.title}
                  {quote.quantity > 1
                    ? ` · ${quote.quantity} шт.`
                    : ''}
                </div>

                <StatusBadge status={quote.status} />
              </header>

              <InfoTable
                title="Место назначения"
                rows={[
                  {
                    label: 'Регион',
                    value: quote.destinationRegion,
                  },
                  {
                    label: 'Город',
                    value: quote.destinationCity,
                  },
                  {
                    label: 'Адрес',
                    value: quote.destinationAddress,
                  },
                  {
                    label: 'Разгрузка',
                    value: quote.unloadingRequired
                      ? 'Требуется'
                      : 'Не требуется',
                  },
                  ...(quote.accessRestrictions
                    ? [
                      {
                        label: 'Ограничения',
                        value: quote.accessRestrictions,
                      },
                    ]
                    : []),
                ]}
              />

              <InfoTable
                title="Данные клиента"
                rows={[
                  {
                    label: 'Имя',
                    value: quote.customerName,
                  },
                  {
                    label: 'Телефон',
                    value: quote.customerPhone,
                  },
                  ...(quote.customerEmail
                    ? [
                      {
                        label: 'Email',
                        value: quote.customerEmail,
                      },
                    ]
                    : []),
                  ...(quote.customerComment
                    ? [
                      {
                        label: 'Комментарий',
                        value: quote.customerComment,
                      },
                    ]
                    : []),
                ]}
              />

              {quote.confirmedDeliveryPrice != null && (
                <div className="rounded-lg bg-primary/5 px-4 py-2 text-sm">
                  <span className="font-medium">Текущая цена:</span>{' '}
                  {formatPrice(quote.confirmedDeliveryPrice)}
                </div>
              )}

              <form className="flex flex-col gap-6">
                <div className="flex flex-col gap-5">
                  <FormInputField
                    name={`price-${quote.id}`}
                    label="Цена доставки"
                    type="number"
                    min={0}
                    value={draft.price}
                    onChange={(event) =>
                      update({
                        price: event.target.value,
                      })
                    }
                  />

                  <FormInputField
                    name={`expires-${quote.id}`}
                    label="Действует до"
                    type="datetime-local"
                    value={draft.expiresAt}
                    onChange={(event) =>
                      update({
                        expiresAt: event.target.value,
                      })
                    }
                  />

                  <FormTextareaField
                    name={`comment-${quote.id}`}
                    label="Комментарий менеджера"
                    rows={3}
                    value={draft.comment}
                    onChange={(event) =>
                      update({
                        comment: event.target.value,
                      })
                    }
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="accent"
                    onClick={() =>
                      mutation.mutate({
                        id: quote.id,
                        status: 'QUOTED',
                      })
                    }
                  >
                    Подтвердить цену
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      mutation.mutate({
                        id: quote.id,
                        status: 'EXPIRED',
                      })
                    }
                  >
                    Пометить истёкшим
                  </Button>

                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() =>
                      mutation.mutate({
                        id: quote.id,
                        status: 'CANCELLED',
                      })
                    }
                  >
                    Отменить
                  </Button>
                </div>
              </form>
            </article>
          );
        })}
      </div>
    </section>
  );
}