import type {
  AdminTableFilterRangeValue,
  AdminTableFilterValue,
} from '../types/admin-records-table';

export function getAdminTableRangeFilterValue(
  value: AdminTableFilterValue | undefined,
): AdminTableFilterRangeValue {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return value;
}
