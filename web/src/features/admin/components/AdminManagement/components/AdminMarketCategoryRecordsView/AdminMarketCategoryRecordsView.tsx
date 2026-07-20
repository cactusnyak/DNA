import type { ReactNode } from 'react';

import type { AdminMarketCategory } from '@/entities/admin';
import { MarkHighlight } from '@/widgets/MarkHighlight';

import { buildCategoryTree } from '../../../../logic/build-category-tree';
import { AdminCategoryTreeView } from '../../../AdminCategoryTreeView';
import { AdminRecordsList } from '../../../AdminRecordsList';
import { AdminRecordsTable } from '../../../AdminRecordsTable';
import type { AdminBulkAction } from '../../../AdminRecordsTable/types/admin-records-table';
import { getAdminRecordStatusLabel } from '../../../../logic/get-admin-record-status-label';
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
          <MarkHighlight text={category.name} searchValue={searchValue} level={1} />
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
          <MarkHighlight text={category.name} searchValue={searchValue} level={1} />
        }
        getDescription={(category) =>
          category.description
            ? <MarkHighlight text={category.description} searchValue={searchValue} level={2} />
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
          key: 'id',
          title: 'ID',
          width: 100,
          sortable: false,
          getValue: (category) => category.id,
          render: (category) => (
            <code className="truncate rounded bg-muted px-1 py-0.5 text-xs font-mono">
              {category.id.slice(0, 8)}
            </code>
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
            <MarkHighlight text={category.name} searchValue={searchValue} level={1} />,
        },
        {
          key: 'slug',
          title: 'Slug',
          width: 220,
          sortable: true,
          filter: { type: 'text', placeholder: 'Slug' },
          getValue: (category) => category.slug,
          render: (category) =>
            <MarkHighlight text={category.slug} searchValue={searchValue} level={2} />,
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
