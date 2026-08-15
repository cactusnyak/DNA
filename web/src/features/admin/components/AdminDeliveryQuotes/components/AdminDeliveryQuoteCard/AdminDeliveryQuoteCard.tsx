import { Button } from '@/components/ui/Button';
import { FormInputField, FormTextareaField } from '@/components/ui/FormField';
import { ResourceLink } from '@/components/ui/ResourceLink';
import { AdminShortId } from '@/features/admin/components/AdminShortId';
import type { DeliveryQuoteStatus } from '@/entities/delivery-quote';
import { formatPrice } from '@/shared/utils/format-price';
import { formatAdminQuoteCreatedAt } from '../../logic/format-admin-quote-created-at';
import { getAdminQuoteDraft } from '../../logic/get-admin-quote-draft';
import type { AdminQuote, AdminQuoteDraft } from '../../types/admin-delivery-quotes';
import { InfoTable } from '../InfoTable';
import { StatusBadge } from '../StatusBadge';

type AdminDeliveryQuoteCardProps = {
  quote: AdminQuote;
  draft?: AdminQuoteDraft;
  isHidden: boolean;
  onDraftChange: (draft: Partial<AdminQuoteDraft>) => void;
  onStatusChange: (status: DeliveryQuoteStatus) => void;
  onVisibilityToggle: () => void;
};

export function AdminDeliveryQuoteCard({
  quote,
  draft = getAdminQuoteDraft(quote),
  isHidden,
  onDraftChange,
  onStatusChange,
  onVisibilityToggle,
}: AdminDeliveryQuoteCardProps) {
  return (
    <article className="flex w-fit min-w-0 max-w-full flex-none flex-col gap-7 rounded-2xl p-5 shadow-card-xl">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <h3 className='font-medium'>Заявка на рассчет от <span>{formatAdminQuoteCreatedAt(quote.createdAt)}</span>, №<span>{quote.id.slice(0, 8)}</span></h3>
        <StatusBadge status={quote.status} />
      </header>

      <div className='flex flex-col gap-5'>
        <InfoTable title="Данные о товаре" rows={[
          {
            label: 'Название',
            value: `${quote.product.title}${quote.quantity > 1 ? ` · ${quote.quantity} шт.` : ''}`,
          },
          {
            label: 'ID',
            value: <AdminShortId value={quote.productId} />,
          },
          {
            label: 'Ссылка',
            value: (
              <ResourceLink href={`/product/${quote.productId}`}>
                {quote.product.title}
              </ResourceLink>
            ),
          },
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
          <span className="font-medium">Текущая цена:</span>{' '}
          {formatPrice(quote.confirmedDeliveryPrice)}
        </div>
      )}

      <form className="flex flex-col gap-6">
        <div className="flex flex-col gap-5">
          <div className='flex gap-4'>
            <FormInputField name={`price-${quote.id}`} label="Цена доставки" type="number" min={0} value={draft.price} onChange={(event) => onDraftChange({ price: event.target.value })} />
            <FormInputField name={`expires-${quote.id}`} label="Действует до" type="datetime-local" value={draft.expiresAt} onChange={(event) => onDraftChange({ expiresAt: event.target.value })} />
          </div>
          <FormTextareaField name={`comment-${quote.id}`} label="Комментарий менеджера" rows={3} value={draft.comment} onChange={(event) => onDraftChange({ comment: event.target.value })} />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="accent" onClick={() => onStatusChange('QUOTED')}>Подтвердить цену</Button>
          <Button type="button" variant="dangerous" onClick={() => onStatusChange('EXPIRED')}>Пометить истёкшим</Button>
          <Button type="button" variant="destructive" onClick={() => onStatusChange('CANCELLED')}>Отменить</Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onVisibilityToggle}
          >
            {isHidden ? 'Показать' : 'Скрыть'}
          </Button>
        </div>
      </form>
    </article>
  );
}
