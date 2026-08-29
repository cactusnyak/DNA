import type { ReactNode } from 'react';

import { StatusBadge } from '@/components/ui/StatusBadge';
import { AdminShortId } from '@/features/admin/components/AdminShortId';

import { AdminRecordsTable } from '../../../AdminRecordsTable';
import { AdminRecordsList } from '../../../AdminRecordsList';
import { renderHighlightedText } from '../../../../logic/render-highlighted-text';
import type { AdminViewMode } from '../../../../types/admin-management';
import type { AdminDeliveryQuote } from '../../types/admin-management-records';
import { DELIVERY_QUOTE_STATUS_VARIANTS } from '../../logic/delivery-quote-status';

type Props = {
  quotes: AdminDeliveryQuote[];
  viewMode: AdminViewMode;
  searchValue: string;
  renderActions: (quote: AdminDeliveryQuote) => ReactNode;
};

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function AdminDeliveryQuoteRecordsView({
  quotes,
  viewMode,
  searchValue,
  renderActions,
}: Props) {
  if (viewMode === 'list') {
    return (
      <AdminRecordsList
        records={quotes}
        getRecordKey={(quote) => quote.id}
        getTitle={(quote) =>
          renderHighlightedText(`Заявка № ${quote.id.slice(0, 8)}`, searchValue)
        }
        getDescription={(quote) =>
          renderHighlightedText(
            `${quote.product.title} · ${quote.customerName} · ${quote.customerPhone}`,
            searchValue,
          )
        }
        getMeta={(quote) => {
          const config = DELIVERY_QUOTE_STATUS_VARIANTS[quote.status];

          return (
            <div className="flex flex-wrap items-center gap-2">
              <span>{dateFormatter.format(new Date(quote.createdAt))}</span>
              <StatusBadge text={config.label} variant={config.variant} />
            </div>
          );
        }}
        renderActions={renderActions}
        emptyText="Заявки на расчёт доставки не найдены."
      />
    );
  }

  return (
    <AdminRecordsTable<AdminDeliveryQuote>
      tableKey="oversized-delivery-quotes"
      records={quotes}
      getRecordKey={(quote) => quote.id}
      emptyText="Заявки на расчёт доставки не найдены."
      renderActions={renderActions}
      disableSelection
      columns={[
        {
          key: 'id',
          title: 'ID',
          width: 150,
          sortable: true,
          filter: { type: 'text', placeholder: 'ID заявки' },
          getValue: (quote) => quote.id,
          render: (quote) => <AdminShortId value={quote.id} />,
        },
        {
          key: 'createdAt',
          title: 'Дата',
          width: 200,
          sortable: true,
          filter: { type: 'dateRange' },
          getValue: (quote) => new Date(quote.createdAt),
          render: (quote) => dateFormatter.format(new Date(quote.createdAt)),
        },
        {
          key: 'status',
          title: 'Статус',
          width: 190,
          sortable: true,
          filter: {
            type: 'select',
            options: Object.entries(DELIVERY_QUOTE_STATUS_VARIANTS).map(
              ([value, config]) => ({ value, label: config.label }),
            ),
          },
          getValue: (quote) => quote.status,
          render: (quote) => {
            const config = DELIVERY_QUOTE_STATUS_VARIANTS[quote.status];
            return <StatusBadge text={config.label} variant={config.variant} />;
          },
        },
      ]}
    />
  );
}
