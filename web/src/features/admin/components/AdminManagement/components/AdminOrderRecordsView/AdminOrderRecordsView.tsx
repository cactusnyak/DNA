import type { ReactNode } from 'react';

import type { Order } from '@/entities/order';
import { formatOrderStatus } from '@/entities/order';
import { formatPrice } from '@/shared/utils/format-price';

import { AdminRecordsList } from '../../../AdminRecordsList';
import { AdminRecordsTable } from '../../../AdminRecordsTable';
import type { DeletedAwareRecord } from '../../../AdminRecordsTable/types/admin-records-table';
import { renderHighlightedText } from '../../../../logic/render-highlighted-text';
import type { AdminViewMode } from '../../../../types/admin-management';

type AdminOrderRecord = Order & DeletedAwareRecord;

type AdminOrderRecordsViewProps = {
  orders: Order[];
  viewMode: AdminViewMode;
  searchValue: string;
  renderActions: (order: Order) => ReactNode;
};

function getOrderStatusFilterOptions(orders: Order[]) {
  const statuses = Array.from(new Set(orders.map((order) => order.status)));

  return statuses.map((status) => ({
    value: status,
    label: formatOrderStatus(status),
  }));
}

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
    <AdminRecordsTable<AdminOrderRecord>
      records={orders}
      getRecordKey={(order) => order.id}
      emptyText="Заказы не найдены."
      renderActions={renderActions}
      columns={[
        {
          key: 'id',
          title: 'Заказ',
          width: 170,
          sortable: true,
          filter: {
            type: 'text',
            placeholder: 'ID заказа',
          },
          getValue: (order) => order.id,
          render: (order) =>
            renderHighlightedText(order.id.slice(0, 8), searchValue),
        },
        {
          key: 'customer',
          title: 'Покупатель',
          width: 220,
          sortable: true,
          filter: {
            type: 'text',
            placeholder: 'Имя',
          },
          getValue: (order) => order.customerName,
          render: (order) =>
            renderHighlightedText(order.customerName, searchValue),
        },
        {
          key: 'phone',
          title: 'Телефон',
          width: 180,
          sortable: true,
          filter: {
            type: 'text',
            placeholder: 'Телефон',
          },
          getValue: (order) => order.customerPhone,
          render: (order) =>
            renderHighlightedText(order.customerPhone, searchValue),
        },
        {
          key: 'total',
          title: 'Сумма',
          width: 160,
          align: 'right',
          sortable: true,
          filter: {
            type: 'numberRange',
          },
          getValue: (order) => order.totalAmount,
          render: (order) => formatPrice(order.totalAmount),
        },
        {
          key: 'status',
          title: 'Статус',
          width: 190,
          sortable: true,
          filter: {
            type: 'select',
            options: getOrderStatusFilterOptions(orders),
          },
          getValue: (order) => order.status,
          render: (order) => formatOrderStatus(order.status),
        },
      ]}
    />
  );
}
