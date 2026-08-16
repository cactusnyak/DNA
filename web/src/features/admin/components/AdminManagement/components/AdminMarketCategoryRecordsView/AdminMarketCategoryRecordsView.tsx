import type { ReactNode } from 'react';

import type { AdminMarketCategory } from '@/entities/admin';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AdminShortId } from '@/features/admin/components/AdminShortId';
import { MarkHighlight } from '@/widgets/MarkHighlight';

import { buildCategoryTree } from '../../../../logic/build-category-tree';
import { AdminCategoryTreeView } from '../../../AdminCategoryTreeView';
import { AdminRecordsList } from '../../../AdminRecordsList';
import { AdminRecordsTable } from '../../../AdminRecordsTable';
import { AdminTableImage } from '../../../AdminTableImage';
import type { AdminBulkAction } from '../../../AdminRecordsTable/types/admin-records-table';
import { getAdminRecordStatusLabel } from '../../../../logic/get-admin-record-status-label';
import { getAdminRecordStatusVariant } from '../../../../logic/get-admin-status-variant';
import type { AdminViewMode } from '../../../../types/admin-management';

type AdminMarketCategoryRecordsViewProps = {
  categories: AdminMarketCategory[];
  viewMode: AdminViewMode;
  searchValue: string;
  renderActions: (category: AdminMarketCategory) => ReactNode;
  bulkActions?: AdminBulkAction[];
};

const statusFilterOptions = [
  { value: 'Активно', label: 'Активно' },
  { value: 'Неактивно', label: 'Неактивно' },
  { value: 'Удалено', label: 'Удалено' },
];

const oversizedFilterOptions = [
  { value: 'Да', label: 'Да' },
  { value: 'Нет', label: 'Нет' },
];

export function AdminMarketCategoryRecordsView({
  categories,
  viewMode,
  searchValue,
  renderActions,
  bulkActions,
}: AdminMarketCategoryRecordsViewProps) {
  if (viewMode === 'tree') {
    return (
      <AdminCategoryTreeView
        categories={categories}
        renderTitle={(category) =>
          <MarkHighlight text={category.name} searchValue={searchValue} />
        }
        renderMeta={(category) =>
          `slug: ${category.slug} · продуктов: ${category.productsCount} · крупногабаритная: ${category.isOversized ? 'да' : 'нет'}`
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
          <MarkHighlight text={category.name} searchValue={searchValue} />
        }
        getDescription={(category) =>
          category.description
            ? <MarkHighlight text={category.description} searchValue={searchValue} />
            : 'Без описания'
        }
        getMeta={(category) =>
          `slug: ${category.slug} · крупногабаритная: ${category.isOversized ? 'да' : 'нет'} · ${getAdminRecordStatusLabel(category)}`
        }
        renderActions={renderActions}
        emptyText="Категории маркета не найдены."
      />
    );
  }

  const tree = buildCategoryTree(categories);

  return (
    <AdminRecordsTable
      records={tree}
      getRecordKey={(category) => category.id}
      emptyText="Категории маркета не найдены."
      renderActions={renderActions}
      bulkActions={bulkActions}
      getSubRows={(category) => category.children ?? []}
      columns={[
        {
          key: 'image',
          title: 'Фото',
          width: 72,
          sortable: false,
          getValue: (category) => category.image?.url ?? '',
          render: (category) => (
            <AdminTableImage
              src={category.image?.url}
              alt={category.image?.alt ?? category.name}
            />
          ),
        },
        {
          key: 'id',
          title: 'ID',
          width: 100,
          sortable: false,
          getValue: (category) => category.id,
          render: (category) => (
            <AdminShortId value={category.id} />
          ),
        },
        {
          key: 'name',
          title: 'Название',
          width: 240,
          sortable: true,
          filter: { type: 'text', placeholder: 'Название' },
          getValue: (category) => category.name,
          render: (category) =>
            <MarkHighlight text={category.name} searchValue={searchValue} />,
        },
        {
          key: 'slug',
          title: 'Slug',
          width: 220,
          sortable: true,
          filter: { type: 'text', placeholder: 'Slug' },
          getValue: (category) => category.slug,
          render: (category) =>
            <MarkHighlight text={category.slug} searchValue={searchValue} />,
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
          key: 'isOversized',
          title: 'Крупногабаритная',
          width: 180,
          sortable: true,
          filter: { type: 'select', options: oversizedFilterOptions },
          getValue: (category) => category.isOversized ? 'Да' : 'Нет',
          render: (category) => category.isOversized ? 'Да' : 'Нет',
        },
        {
          key: 'status',
          title: 'Статус',
          width: 160,
          sortable: true,
          filter: { type: 'select', options: statusFilterOptions },
          getValue: (category) => getAdminRecordStatusLabel(category),
          render: (category) => <StatusBadge text={getAdminRecordStatusLabel(category)} variant={getAdminRecordStatusVariant(category)} />,
        },
      ]}
    />
  );
}
