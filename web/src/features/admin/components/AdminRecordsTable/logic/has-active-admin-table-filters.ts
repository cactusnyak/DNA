import type { AdminTableFilterValues } from '../types/admin-records-table';

export function hasActiveAdminTableFilters(filterValues: AdminTableFilterValues) {
  return Object.values(filterValues).some((value) => {
    if (!value) {
      return false;
    }

    if (typeof value === 'string') {
      return Boolean(value.trim());
    }

    return Boolean(value.from?.trim() || value.to?.trim());
  });
}
