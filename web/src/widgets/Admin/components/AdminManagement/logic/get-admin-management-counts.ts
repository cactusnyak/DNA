import type { AdminManagementTabId } from '../../../types/admin-management';
import type { AdminCatalogData } from '../types/admin-management-records';

export function getAdminManagementCounts(data?: AdminCatalogData) {
  return {
    'market-categories': data?.marketCategories.length ?? 0,
    'market-products': data?.products.length ?? 0,
    collections: data?.collections.length ?? 0,
    orders: data?.orders.length ?? 0,
    'ad-categories': data?.adCategories.length ?? 0,
    ads: data?.ads.length ?? 0,
    users: data?.users.length ?? 0,
  } satisfies Record<AdminManagementTabId, number>;
}
