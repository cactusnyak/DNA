import { useState, type ReactNode } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/Button';
import { FormInputField, FormTextareaField } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { ResourceLink } from '@/components/ui/ResourceLink';
import type { DeliveryQuoteStatus } from '@/entities/delivery-quote';
import { AdminShortId } from '@/features/admin/components/AdminShortId';
import { httpClient } from '@/shared/api/http-client';
import { formatPrice } from '@/shared/utils/format-price';

import type { AdminDeliveryQuote } from '../../types/admin-management-records';

type Draft = { price: string; comment: string; expiresAt: string };

type Props = {
  accessToken: string;
  isOpen: boolean;
  quote: AdminDeliveryQuote;
  onClose: () => void;
};

function getDraft(quote: AdminDeliveryQuote): Draft {
  return {
    price: quote.confirmedDeliveryPrice?.toString() ?? '',
    comment: quote.managerComment ?? '',
    expiresAt: quote.expiresAt?.slice(0, 16) ?? '',
  };
}

function InfoTable({ title, rows }: { title: string; rows: { label: string; value: ReactNode }[] }) {
  return (
    <section className="flex flex-col">
      <span className="mb-2 ml-0.5 text-sm font-medium">{title}</span>
      <div className="w-full max-w-full overflow-hidden rounded-lg border border-border/50 bg-white lg:w-fit">
        <table className="w-full table-fixed border-collapse text-xs lg:w-auto lg:table-auto">
          <tbody className="divide-y divide-border/50">
            {rows.map(({ label, value }) => (
              <tr key={label}>
                <th scope="row" className="w-1/3 whitespace-nowrap px-2 py-1 text-left align-top font-medium lg:w-auto">{label}</th>
                <td className="max-w-0 truncate px-2 py-1 align-top lg:max-w-md">{value || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function AdminDeliveryQuoteModal({ accessToken, isOpen, quote, onClose }: Props) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState(() => getDraft(quote));

  const mutation = useMutation({
    mutationFn: (status: DeliveryQuoteStatus) =>
      httpClient(`/admin/delivery-quotes/${quote.id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: {
          status,
          confirmedDeliveryPrice: draft.price === '' ? undefined : Number(draft.price),
          managerComment: draft.comment,
          expiresAt: draft.expiresAt || undefined,
        },
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['admin-delivery-quotes', accessToken] }),
  });

  const setField = (next: Partial<Draft>) => setDraft((current) => ({ ...current, ...next }));

  return (
    <Modal isOpen={isOpen} title={`Заявка №${quote.id.slice(0, 8)}`} size="lg" onClose={onClose}>
      <div className="flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto p-5">
        <div className="flex flex-col gap-5">
          <InfoTable title="Данные о товаре" rows={[
            { label: 'Название', value: `${quote.product.title}${quote.quantity > 1 ? ` · ${quote.quantity} шт.` : ''}` },
            { label: 'ID', value: <AdminShortId value={quote.productId} /> },
            { label: 'Ссылка', value: <ResourceLink href={`/product/${quote.productId}`}>{quote.product.title}</ResourceLink> },
          ]} />
          <InfoTable title="Место назначения" rows={[
            { label: 'Регион', value: quote.destinationRegion },
            { label: 'Город', value: quote.destinationCity },
            { label: 'Адрес', value: quote.destinationAddress },
            { label: 'Разгрузка', value: quote.unloadingRequired ? 'Требуется' : 'Не требуется' },
            ...(quote.accessRestrictions ? [{ label: 'Ограничения', value: quote.accessRestrictions }] : []),
          ]} />
          <InfoTable title="Данные клиента" rows={[
            { label: 'Имя', value: quote.customerName },
            { label: 'Телефон', value: quote.customerPhone },
            ...(quote.customerEmail ? [{ label: 'Email', value: quote.customerEmail }] : []),
            ...(quote.customerComment ? [{ label: 'Комментарий', value: quote.customerComment }] : []),
          ]} />
        </div>

        {quote.confirmedDeliveryPrice != null && (
          <div className="rounded-lg bg-primary/5 px-4 py-2 text-sm">
            <span className="font-medium">Текущая цена:</span>{' '}{formatPrice(quote.confirmedDeliveryPrice)}
          </div>
        )}

        <form className="flex flex-col gap-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4 sm:flex-row">
              <FormInputField name={`price-${quote.id}`} label="Цена доставки" type="number" min={0} value={draft.price} className="flex-1" onChange={(event) => setField({ price: event.target.value })} />
              <FormInputField name={`expires-${quote.id}`} label="Действует до" type="datetime-local" value={draft.expiresAt} className="flex-1" onChange={(event) => setField({ expiresAt: event.target.value })} />
            </div>
            <FormTextareaField name={`comment-${quote.id}`} label="Комментарий менеджера" rows={3} value={draft.comment} onChange={(event) => setField({ comment: event.target.value })} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="accent" disabled={mutation.isPending} onClick={() => mutation.mutate('QUOTED')}>Подтвердить цену</Button>
            <Button type="button" variant="dangerous" disabled={mutation.isPending} onClick={() => mutation.mutate('EXPIRED')}>Пометить истёкшим</Button>
            <Button type="button" variant="destructive" disabled={mutation.isPending} onClick={() => mutation.mutate('CANCELLED')}>Отменить</Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
