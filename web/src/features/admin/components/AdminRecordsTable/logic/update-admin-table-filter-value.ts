import { getAdminTableRangeFilterValue } from './get-admin-table-range-filter-value';

import type {
  AdminTableFilterRangeValue,
  AdminTableFilterValue,
  AdminTableFilterValues,
} from '../types/admin-records-table';

export function getUpdatedAdminTableFilterValues(
  currentValues: AdminTableFilterValues,
  columnKey: string,
  value: AdminTableFilterValue,
): AdminTableFilterValues {
  return {
    ...currentValues,
    [columnKey]: value,
  };
}

export function getUpdatedAdminTableRangeFilterValues(
  currentValues: AdminTableFilterValues,
  columnKey: string,
  field: keyof AdminTableFilterRangeValue,
  value: string,
): AdminTableFilterValues {
  const rangeValue = getAdminTableRangeFilterValue(currentValues[columnKey]);

  return {
    ...currentValues,
    [columnKey]: {
      ...rangeValue,
      [field]: value,
    },
  };
}
