import type { ReactNode } from 'react';

import type {
  AdminCatalogCollection,
  AdminCategory,
  AdminProduct,
} from '@/entities/admin';
import type { Order } from '@/entities/order';

import type {
  AdminManagementTabId,
  AdminViewMode,
} from '../../../../types/admin-management';
import { AdminCategoryRecordsView } from '../AdminCategoryRecordsView';
import { AdminCollectionRecordsView } from '../AdminCollectionRecordsView';
import { AdminOrderRecordsView } from '../AdminOrderRecordsView';
import { AdminProductRecordsView } from '../AdminProductRecordsView';

import type {
  EditableRecord,
  FilteredAdminRecords,
} from '../../types/admin-management-records';

type AdminManagementRecordsProps = {
  activeTabId: AdminManagementTabId;
  viewMode: AdminViewMode;
  searchValue: string;
  records: FilteredAdminRecords;
  renderActions: (record: EditableRecord) => ReactNode;
};

export function AdminManagementRecords({
  activeTabId,
  viewMode,
  searchValue,
  records,
  renderActions,
}: AdminManagementRecordsProps) {
  if (activeTabId === 'categories') {
    return (
      <AdminCategoryRecordsView
        categories={records.categories}
        viewMode={viewMode}
        searchValue={searchValue}
        renderActions={(category: AdminCategory) => renderActions(category)}
      />
    );
  }

  if (activeTabId === 'products') {
    return (
      <AdminProductRecordsView
        products={records.products}
        viewMode={viewMode}
        searchValue={searchValue}
        renderActions={(product: AdminProduct) => renderActions(product)}
      />
    );
  }

  if (activeTabId === 'collections') {
    return (
      <AdminCollectionRecordsView
        collections={records.collections}
        viewMode={viewMode}
        searchValue={searchValue}
        renderActions={(collection: AdminCatalogCollection) =>
          renderActions(collection)
        }
      />
    );
  }

  return (
    <AdminOrderRecordsView
      orders={records.orders}
      viewMode={viewMode}
      searchValue={searchValue}
      renderActions={(order: Order) => renderActions(order)}
    />
  );
}
