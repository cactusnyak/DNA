import type { ReactNode } from 'react';

import type { AdminProduct } from '@/entities/admin';
import { formatPrice } from '@/shared/utils/format-price';

import { AdminRecordsList } from '../../../AdminRecordsList';
import { AdminRecordsTable } from '../../../AdminRecordsTable';
import { getAdminRecordStatusLabel } from '../../../../logic/get-admin-record-status-label';
import { renderHighlightedText } from '../../../../logic/render-highlighted-text';
import type { AdminViewMode } from '../../../../types/admin-management';

type AdminProductRecordsViewProps = {
  products: AdminProduct[];
  viewMode: AdminViewMode;
  searchValue: string;
  renderActions: (product: AdminProduct) => ReactNode;
};

const statusFilterOptions = [
  {
    value: 'Активно',
    label: 'Активно',
  },
  {
    value: 'Неактивно',
    label: 'Неактивно',
  },
  {
    value: 'Удалено',
    label: 'Удалено',
  },
];

function getCategoryFilterOptions(products: AdminProduct[]) {
  const optionsByValue = new Map<string, string>();

  products.forEach((product) => {
    const value = product.category?.name || 'Без категории';
    optionsByValue.set(value, value);
  });

  return Array.from(optionsByValue.entries())
    .map(([value, label]) => ({
      value,
      label,
    }))
    .sort((firstOption, secondOption) =>
      firstOption.label.localeCompare(secondOption.label),
    );
}

export function AdminProductRecordsView({
  products,
  viewMode,
  searchValue,
  renderActions,
}: AdminProductRecordsViewProps) {
  if (viewMode === 'list') {
    return (
      <AdminRecordsList
        records={products}
        getRecordKey={(product) => product.id}
        getTitle={(product) =>
          renderHighlightedText(product.title, searchValue)
        }
        getDescription={(product) =>
          renderHighlightedText(
            product.description || 'Без описания',
            searchValue,
          )
        }
        getMeta={(product) =>
          `${product.category?.name ?? 'Без категории'} · ${formatPrice(product.price)} · ${getAdminRecordStatusLabel(product)}`
        }
        renderActions={renderActions}
        emptyText="Продукты не найдены."
      />
    );
  }

  return (
    <AdminRecordsTable
      records={products}
      getRecordKey={(product) => product.id}
      emptyText="Продукты не найдены."
      renderActions={renderActions}
      columns={[
        {
          key: 'title',
          title: 'Название',
          width: 280,
          sortable: true,
          filter: {
            type: 'text',
            placeholder: 'Название',
          },
          getValue: (product) => product.title,
          render: (product) =>
            renderHighlightedText(product.title, searchValue),
        },
        {
          key: 'category',
          title: 'Категория',
          width: 220,
          sortable: true,
          filter: {
            type: 'select',
            options: getCategoryFilterOptions(products),
          },
          getValue: (product) => product.category?.name || 'Без категории',
          render: (product) =>
            renderHighlightedText(product.category?.name ?? '', searchValue),
        },
        {
          key: 'price',
          title: 'Цена',
          width: 160,
          align: 'right',
          sortable: true,
          filter: {
            type: 'numberRange',
          },
          getValue: (product) => product.price,
          render: (product) => formatPrice(product.price),
        },
        {
          key: 'status',
          title: 'Статус',
          width: 160,
          sortable: true,
          filter: {
            type: 'select',
            options: statusFilterOptions,
          },
          getValue: (product) => getAdminRecordStatusLabel(product),
          render: (product) => getAdminRecordStatusLabel(product),
        },
      ]}
    />
  );
}
