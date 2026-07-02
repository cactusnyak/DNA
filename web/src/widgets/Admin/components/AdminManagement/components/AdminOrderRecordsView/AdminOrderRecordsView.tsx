import type { ReactNode } from 'react';

import type { Order } from '@/entities/order';
import { formatOrderStatus } from '@/entities/order';
import { formatPrice } from '@/shared/utils/format-price';

import { AdminRecordsList } from '../../../AdminRecordsList';
import { AdminRecordsTable } from '../../../AdminRecordsTable';
import { renderHighlightedText } from '../../../../logic/render-highlighted-text';
import type { AdminViewMode } from '../../../../types/admin-management';

type AdminOrderRecordsViewProps = {
  orders: Order[];
  viewMode: AdminViewMode;
  searchValue: string;
  renderActions: (order: Order) => ReactNode;
};

export function AdminOrderRecordsView({
  orders,
  viewMode,
  searchValue,
  renderActions,
}: AdminOrderRecordsViewProps) {
  if (viewMode === 'list') {
    return (
      <AdminRecordsList
        records={orders}
        getRecordKey={(order) => order.id}
        getTitle={(order) =>
          renderHighlightedText(`Заказ № ${order.id.slice(0, 8)}`, searchValue)
        }
        getDescription={(order) =>
          renderHighlightedText(
            `${order.customerName}, ${order.customerPhone}, ${order.deliveryAddress}`,
            searchValue,
          )
        }
        getMeta={(order) =>
          `${formatPrice(order.totalAmount)} · ${formatOrderStatus(order.status)}`
        }
        renderActions={renderActions}
        emptyText="Заказы не найдены."
      />
    );
  }

  return (
    <AdminRecordsTable
      records={orders}
      getRecordKey={(order) => order.id}
      emptyText="Заказы не найдены."
      renderActions={renderActions}
      columns={[
        {
          key: 'id',
          title: 'Заказ',
          render: (order) =>
            renderHighlightedText(order.id.slice(0, 8), searchValue),
        },
        {
          key: 'customer',
          title: 'Покупатель',
          render: (order) =>
            renderHighlightedText(order.customerName, searchValue),
        },
        {
          key: 'phone',
          title: 'Телефон',
          render: (order) =>
            renderHighlightedText(order.customerPhone, searchValue),
        },
        {
          key: 'total',
          title: 'Сумма',
          render: (order) => formatPrice(order.totalAmount),
        },
        {
          key: 'status',
          title: 'Статус',
          render: (order) => formatOrderStatus(order.status),
        },
      ]}
    />
  );
}
