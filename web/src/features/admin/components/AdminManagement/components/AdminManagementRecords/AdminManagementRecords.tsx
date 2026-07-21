import type { ReactNode } from 'react';

import type {
  AdminAd,
  AdminAdCategory,
  AdminCatalogCollection,
  AdminMarketCategory,
  AdminProduct,
  AdminUser,
} from '@/entities/admin';
import type { Order } from '@/entities/order';

import type { AdminBulkAction } from '../../../AdminRecordsTable/types/admin-records-table';
import type {
  AdminManagementTabId,
  AdminViewMode,
} from '../../../../types/admin-management';
import { AdminAdCategoryRecordsView } from '../AdminAdCategoryRecordsView';
import { AdminAdRecordsView } from '../AdminAdRecordsView';
import { AdminCollectionRecordsView } from '../AdminCollectionRecordsView';
import { AdminMarketCategoryRecordsView } from '../AdminMarketCategoryRecordsView';
import { AdminOrderRecordsView } from '../AdminOrderRecordsView';
import { AdminProductRecordsView } from '../AdminProductRecordsView';
import { AdminReferralRecordsView } from '../AdminReferralRecordsView/AdminReferralRecordsView';
import { AdminUserRecordsView } from '../AdminUserRecordsView';

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
  bulkActions?: AdminBulkAction[];
};

export function AdminManagementRecords({
  activeTabId,
  viewMode,
  searchValue,
  records,
  renderActions,
  bulkActions,
}: AdminManagementRecordsProps) {
  if (activeTabId === 'market-categories') {
    return (
      <AdminMarketCategoryRecordsView
        categories={records.marketCategories}
        viewMode={viewMode}
        searchValue={searchValue}
        renderActions={(category: AdminMarketCategory) =>
          renderActions(category)
        }
        bulkActions={bulkActions}
      />
    );
  }

  if (activeTabId === 'market-products') {
    return (
      <AdminProductRecordsView
        products={records.products}
        viewMode={viewMode}
        searchValue={searchValue}
        renderActions={(product: AdminProduct) => renderActions(product)}
        bulkActions={bulkActions}
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
        bulkActions={bulkActions}
      />
    );
  }

  if (activeTabId === 'ad-categories') {
    return (
      <AdminAdCategoryRecordsView
        categories={records.adCategories}
        viewMode={viewMode}
        searchValue={searchValue}
        renderActions={(category: AdminAdCategory) => renderActions(category)}
        bulkActions={bulkActions}
      />
    );
  }

  if (activeTabId === 'ads') {
    return (
      <AdminAdRecordsView
        ads={records.ads}
        viewMode={viewMode}
        searchValue={searchValue}
        renderActions={(ad: AdminAd) => renderActions(ad)}
        bulkActions={bulkActions}
      />
    );
  }

  if (activeTabId === 'users') {
    return (
      <AdminUserRecordsView
        users={records.users}
        viewMode={viewMode}
        searchValue={searchValue}
        renderActions={(user: AdminUser) => renderActions(user)}
        bulkActions={bulkActions}
      />
    );
  }

  if (activeTabId === 'referrals') {
    return (
      <AdminReferralRecordsView
        referrals={records.referrals}
        viewMode={viewMode}
        searchValue={searchValue}
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
