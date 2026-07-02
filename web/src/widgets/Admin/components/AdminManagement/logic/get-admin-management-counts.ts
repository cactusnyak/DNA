import type { AdminManagementTabId } from '../../../types/admin-management';
import type { AdminCatalogData } from '../types/admin-management-records';

export function getAdminManagementCounts(data?: AdminCatalogData) {
  return {
    categories: data?.categories.length ?? 0,
    products: data?.products.length ?? 0,
    collections: data?.collections.length ?? 0,
    orders: data?.orders.length ?? 0,
  } satisfies Record<AdminManagementTabId, number>;
}
