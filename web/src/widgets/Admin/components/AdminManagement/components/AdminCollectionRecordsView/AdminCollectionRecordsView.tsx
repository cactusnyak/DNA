import type { ReactNode } from 'react';

import type { AdminCatalogCollection } from '@/entities/admin';

import { AdminRecordsList } from '../../../AdminRecordsList';
import { AdminRecordsTable } from '../../../AdminRecordsTable';
import { getAdminRecordStatusLabel } from '../../../../logic/get-admin-record-status-label';
import { renderHighlightedText } from '../../../../logic/render-highlighted-text';
import type { AdminViewMode } from '../../../../types/admin-management';

type AdminCollectionRecordsViewProps = {
  collections: AdminCatalogCollection[];
  viewMode: AdminViewMode;
  searchValue: string;
  renderActions: (collection: AdminCatalogCollection) => ReactNode;
};

const collectionTypeFilterOptions = [
  {
    value: 'CATEGORY',
    label: 'Категории',
  },
  {
    value: 'PRODUCT',
    label: 'Продукты',
  },
];

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

function getCollectionTypeLabel(collection: AdminCatalogCollection) {
  return collection.type === 'CATEGORY' ? 'Категории' : 'Продукты';
}

function getCollectionItemsCount(collection: AdminCatalogCollection) {
  return collection.type === 'CATEGORY'
    ? collection.categories.length
    : collection.products.length;
}

export function AdminCollectionRecordsView({
  collections,
  viewMode,
  searchValue,
  renderActions,
}: AdminCollectionRecordsViewProps) {
  if (viewMode === 'list') {
    return (
      <AdminRecordsList
        records={collections}
        getRecordKey={(collection) => collection.id}
        getTitle={(collection) =>
          renderHighlightedText(collection.title, searchValue)
        }
        getDescription={(collection) =>
          renderHighlightedText(
            collection.description || 'Без описания',
            searchValue,
          )
        }
        getMeta={(collection) =>
          `${getCollectionTypeLabel(collection)} · ${collection.slug} · ${getAdminRecordStatusLabel(collection)}`
        }
        renderActions={renderActions}
        emptyText="Подборки не найдены."
      />
    );
  }

  return (
    <AdminRecordsTable
      records={collections}
      getRecordKey={(collection) => collection.id}
      emptyText="Подборки не найдены."
      renderActions={renderActions}
      columns={[
        {
          key: 'title',
          title: 'Название',
          width: 260,
          sortable: true,
          filter: {
            type: 'text',
            placeholder: 'Название',
          },
          getValue: (collection) => collection.title,
          render: (collection) =>
            renderHighlightedText(collection.title, searchValue),
        },
        {
          key: 'slug',
          title: 'Slug',
          width: 220,
          sortable: true,
          filter: {
            type: 'text',
            placeholder: 'Slug',
          },
          getValue: (collection) => collection.slug,
          render: (collection) =>
            renderHighlightedText(collection.slug, searchValue),
        },
        {
          key: 'type',
          title: 'Тип',
          width: 160,
          sortable: true,
          filter: {
            type: 'select',
            options: collectionTypeFilterOptions,
          },
          getValue: (collection) => collection.type,
          render: getCollectionTypeLabel,
        },
        {
          key: 'items',
          title: 'Элементов',
          width: 150,
          align: 'right',
          sortable: true,
          filter: {
            type: 'numberRange',
          },
          getValue: getCollectionItemsCount,
          render: getCollectionItemsCount,
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
          getValue: (collection) => getAdminRecordStatusLabel(collection),
          render: (collection) => getAdminRecordStatusLabel(collection),
        },
      ]}
    />
  );
}
