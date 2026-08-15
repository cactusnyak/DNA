import { type KeyboardEvent, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { DeliveryQuoteStatus } from '@/entities/delivery-quote';
import { DELIVERY_QUOTE_STATUS_VARIANTS } from '../../data/admin-delivery-quotes';
import { formatAdminQuoteCreatedAt } from '../../logic/format-admin-quote-created-at';
import { getAdminQuoteDraft } from '../../logic/get-admin-quote-draft';
import type { AdminQuote, AdminQuoteDraft } from '../../types/admin-delivery-quotes';
import { AdminDeliveryQuoteModal } from '../AdminDeliveryQuoteModal';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const statusConfig = DELIVERY_QUOTE_STATUS_VARIANTS[quote.status];
  const openModal = () => setIsModalOpen(true);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openModal();
    }
  };

  return (
    <>
      <article
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        aria-expanded={isModalOpen}
        className="flex w-fit min-w-0 max-w-full cursor-pointer flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/8 bg-primary/3 text-left hover:bg-primary/6 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        onClick={openModal}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center gap-3 p-2">
          <h3 className="pl-2 text-sm font-medium">
            Заявка на рассчет от{' '}
            <span>{formatAdminQuoteCreatedAt(quote.createdAt)}</span>, №
            <span>{quote.id.slice(0, 8)}</span>
          </h3>
          <StatusBadge className={statusConfig.className}>
            {statusConfig.label}
          </StatusBadge>
        </div>
        <div className="border-l border-primary/8 p-2">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label={isHidden ? 'Показать заявку' : 'Скрыть заявку'}
            title={isHidden ? 'Показать' : 'Скрыть'}
            onClick={(event) => {
              event.stopPropagation();
              onVisibilityToggle();
            }}
          >
            {isHidden ? <Eye /> : <EyeOff />}
          </Button>
        </div>
      </article>

      <AdminDeliveryQuoteModal
        isOpen={isModalOpen}
        quote={quote}
        draft={draft}
        onClose={() => setIsModalOpen(false)}
        onDraftChange={onDraftChange}
        onStatusChange={onStatusChange}
      />
    </>
  );
}