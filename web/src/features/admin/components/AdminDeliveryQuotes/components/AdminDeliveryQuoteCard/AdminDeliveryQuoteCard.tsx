import { Button } from '@/components/ui/Button';
import { FormInputField, FormTextareaField } from '@/components/ui/FormField';
import type { DeliveryQuoteStatus } from '@/entities/delivery-quote';
import { formatPrice } from '@/shared/utils/format-price';
import { getAdminQuoteDraft } from '../../logic/get-admin-quote-draft';
import type { AdminQuote, AdminQuoteDraft } from '../../types/admin-delivery-quotes';
import { InfoTable } from '../InfoTable';
import { StatusBadge } from '../StatusBadge';

type AdminDeliveryQuoteCardProps = {
  quote: AdminQuote;
  draft?: AdminQuoteDraft;
  onDraftChange: (draft: Partial<AdminQuoteDraft>) => void;
  onStatusChange: (status: DeliveryQuoteStatus) => void;
};

export function AdminDeliveryQuoteCard({ quote, draft = getAdminQuoteDraft(quote), onDraftChange, onStatusChange }: AdminDeliveryQuoteCardProps) {
  return (
    <article className="flex min-w-0 flex-1 basis-[30rem] flex-col gap-7 rounded-xl border border-border/80 p-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="font-medium">
          {quote.product.title}{quote.quantity > 1 ? ` · ${quote.quantity} шт.` : ''}
        </div>
        <StatusBadge status={quote.status} />
      </header>

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

      {quote.confirmedDeliveryPrice != null && (
        <div className="rounded-lg bg-primary/5 px-4 py-2 text-sm">
          <span className="font-medium">Текущая цена:</span>{' '}
          {formatPrice(quote.confirmedDeliveryPrice)}
        </div>
      )}

      <form className="flex flex-col gap-6">
        <div className="flex flex-col gap-5">
          <FormInputField name={`price-${quote.id}`} label="Цена доставки" type="number" min={0} value={draft.price} onChange={(event) => onDraftChange({ price: event.target.value })} />
          <FormInputField name={`expires-${quote.id}`} label="Действует до" type="datetime-local" value={draft.expiresAt} onChange={(event) => onDraftChange({ expiresAt: event.target.value })} />
          <FormTextareaField name={`comment-${quote.id}`} label="Комментарий менеджера" rows={3} value={draft.comment} onChange={(event) => onDraftChange({ comment: event.target.value })} />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="accent" onClick={() => onStatusChange('QUOTED')}>Подтвердить цену</Button>
          <Button type="button" variant="dangerous" onClick={() => onStatusChange('EXPIRED')}>Пометить истёкшим</Button>
          <Button type="button" variant="destructive" onClick={() => onStatusChange('CANCELLED')}>Отменить</Button>
        </div>
      </form>
    </article>
  );
}
