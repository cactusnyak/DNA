import { Button } from '@/components/ui/Button';
import { FormInputField, FormTextareaField } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { ResourceLink } from '@/components/ui/ResourceLink';
import type { DeliveryQuoteStatus } from '@/entities/delivery-quote';
import { AdminShortId } from '@/features/admin/components/AdminShortId';
import { formatPrice } from '@/shared/utils/format-price';
import type { AdminQuote, AdminQuoteDraft } from '../../types/admin-delivery-quotes';
import { InfoTable } from '../InfoTable';

type AdminDeliveryQuoteModalProps = {
  isOpen: boolean;
  quote: AdminQuote;
  draft: AdminQuoteDraft;
  onClose: () => void;
  onDraftChange: (draft: Partial<AdminQuoteDraft>) => void;
  onStatusChange: (status: DeliveryQuoteStatus) => void;
};

export function AdminDeliveryQuoteModal({
  isOpen,
  quote,
  draft,
  onClose,
  onDraftChange,
  onStatusChange,
}: AdminDeliveryQuoteModalProps) {
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
            <span className="font-medium">Текущая цена:</span>{' '}
            {formatPrice(quote.confirmedDeliveryPrice)}
          </div>
        )}

        <form className="flex flex-col gap-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4 sm:flex-row">
              <FormInputField name={`price-${quote.id}`} label="Цена доставки" type="number" min={0} value={draft.price} className="flex-1" onChange={(event) => onDraftChange({ price: event.target.value })} />
              <FormInputField name={`expires-${quote.id}`} label="Действует до" type="datetime-local" value={draft.expiresAt} className="flex-1" onChange={(event) => onDraftChange({ expiresAt: event.target.value })} />
            </div>
            <FormTextareaField name={`comment-${quote.id}`} label="Комментарий менеджера" rows={3} value={draft.comment} onChange={(event) => onDraftChange({ comment: event.target.value })} />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="accent" onClick={() => onStatusChange('QUOTED')}>Подтвердить цену</Button>
            <Button type="button" variant="dangerous" onClick={() => onStatusChange('EXPIRED')}>Пометить истёкшим</Button>
            <Button type="button" variant="destructive" onClick={() => onStatusChange('CANCELLED')}>Отменить</Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
