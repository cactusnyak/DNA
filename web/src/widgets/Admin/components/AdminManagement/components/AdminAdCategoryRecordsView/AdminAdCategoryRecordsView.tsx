import type { ReactNode } from 'react';

import type { AdminAdCategory } from '@/entities/admin';

import { AdminCategoryTreeView } from '../../../AdminCategoryTreeView';
import { AdminRecordsList } from '../../../AdminRecordsList';
import { AdminRecordsTable } from '../../../AdminRecordsTable';
import { getAdminRecordStatusLabel } from '../../../../logic/get-admin-record-status-label';
import { renderHighlightedText } from '../../../../logic/render-highlighted-text';
import type { AdminViewMode } from '../../../../types/admin-management';

type AdminAdCategoryRecordsViewProps = {
  categories: AdminAdCategory[];
  viewMode: AdminViewMode;
  searchValue: string;
  renderActions: (category: AdminAdCategory) => ReactNode;
};

const statusFilterOptions = [
  { value: 'Активно', label: 'Активно' },
  { value: 'Неактивно', label: 'Неактивно' },
  { value: 'Удалено', label: 'Удалено' },
];

export function AdminAdCategoryRecordsView({
  categories,
  viewMode,
  searchValue,
  renderActions,
}: AdminAdCategoryRecordsViewProps) {
  if (viewMode === 'tree') {
    return (
      <AdminCategoryTreeView
        categories={categories}
        renderTitle={(category) =>
          renderHighlightedText(category.name, searchValue)
        }
        renderMeta={(category) =>
          `slug: ${category.slug} · объявлений: ${category.adsCount}`
        }
        renderActions={renderActions}
        emptyText="Категории объявлений не найдены."
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
        emptyText="Категории объявлений не найдены."
      />
    );
  }

  return (
    <AdminRecordsTable
      records={categories}
      getRecordKey={(category) => category.id}
      emptyText="Категории объявлений не найдены."
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
          key: 'ads',
          title: 'Объявлений',
          width: 150,
          align: 'right',
          sortable: true,
          filter: { type: 'numberRange' },
          getValue: (category) => category.adsCount,
          render: (category) => category.adsCount,
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
