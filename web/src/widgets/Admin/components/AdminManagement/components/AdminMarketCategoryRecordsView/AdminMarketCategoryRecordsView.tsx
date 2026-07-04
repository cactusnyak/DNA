import type { ReactNode } from 'react';

import type { AdminMarketCategory } from '@/entities/admin';

import { AdminCategoryTreeView } from '../../../AdminCategoryTreeView';
import { AdminRecordsList } from '../../../AdminRecordsList';
import { AdminRecordsTable } from '../../../AdminRecordsTable';
import { getAdminRecordStatusLabel } from '../../../../logic/get-admin-record-status-label';
import { renderHighlightedText } from '../../../../logic/render-highlighted-text';
import type { AdminViewMode } from '../../../../types/admin-management';

type AdminMarketCategoryRecordsViewProps = {
  categories: AdminMarketCategory[];
  viewMode: AdminViewMode;
  searchValue: string;
  renderActions: (category: AdminMarketCategory) => ReactNode;
};

const statusFilterOptions = [
  { value: 'Активно', label: 'Активно' },
  { value: 'Неактивно', label: 'Неактивно' },
  { value: 'Удалено', label: 'Удалено' },
];

export function AdminMarketCategoryRecordsView({
  categories,
  viewMode,
  searchValue,
  renderActions,
}: AdminMarketCategoryRecordsViewProps) {
  if (viewMode === 'tree') {
    return (
      <AdminCategoryTreeView
        categories={categories}
        renderTitle={(category) =>
          renderHighlightedText(category.name, searchValue)
        }
        renderMeta={(category) =>
          `slug: ${category.slug} · продуктов: ${category.productsCount}`
        }
        renderActions={renderActions}
      />
    );
  }

  if (viewMode === 'list') {
    return (
      <AdminRecordsList
        records={categories}
        getRecordKey={(category) => category.id}
        getTitle={(category) =>
          renderHighlightedText(category.name, searchValue)
        }
        getDescription={(category) =>
          category.description
            ? renderHighlightedText(category.description, searchValue)
            : 'Без описания'
        }
        getMeta={(category) =>
          `slug: ${category.slug} · ${getAdminRecordStatusLabel(category)}`
        }
        renderActions={renderActions}
        emptyText="Категории маркета не найдены."
      />
    );
  }

  return (
    <AdminRecordsTable
      records={categories}
      getRecordKey={(category) => category.id}
      emptyText="Категории маркета не найдены."
      renderActions={renderActions}
      columns={[
        {
          key: 'name',
          title: 'Название',
          width: 240,
          sortable: true,
          filter: { type: 'text', placeholder: 'Название' },
          getValue: (category) => category.name,
          render: (category) =>
            renderHighlightedText(category.name, searchValue),
        },
        {
          key: 'slug',
          title: 'Slug',
          width: 220,
          sortable: true,
          filter: { type: 'text', placeholder: 'Slug' },
          getValue: (category) => category.slug,
          render: (category) =>
            renderHighlightedText(category.slug, searchValue),
        },
        {
          key: 'products',
          title: 'Продуктов',
          width: 140,
          align: 'right',
          sortable: true,
          filter: { type: 'numberRange' },
          getValue: (category) => category.productsCount,
          render: (category) => category.productsCount,
        },
        {
          key: 'status',
          title: 'Статус',
          width: 160,
          sortable: true,
          filter: { type: 'select', options: statusFilterOptions },
          getValue: (category) => getAdminRecordStatusLabel(category),
          render: (category) => getAdminRecordStatusLabel(category),
        },
      ]}
    />
  );
}
