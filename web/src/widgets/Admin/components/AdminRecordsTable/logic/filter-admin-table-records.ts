import { getAdminTableCellValue } from './get-admin-table-cell-value';
import { getAdminTableFilterConfig } from './get-admin-table-filter-config';
import { normalizeAdminTableValue } from './normalize-admin-table-value';

import type {
  AdminTableColumn,
  AdminTableFilterRangeValue,
  AdminTableFilterValue,
  AdminTableFilterValues,
} from '../types/admin-records-table';

function isRangeFilterValue(
  value: AdminTableFilterValue | undefined,
): value is AdminTableFilterRangeValue {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function isEmptyFilterValue(value: AdminTableFilterValue | undefined) {
  if (!value) {
    return true;
  }

  if (typeof value === 'string') {
    return !value.trim();
  }

  return !value.from?.trim() && !value.to?.trim();
}

function matchesTextFilter(value: unknown, filterValue: string) {
  return String(value ?? '').toLowerCase().includes(filterValue.trim().toLowerCase());
}

function matchesSelectFilter(value: unknown, filterValue: string) {
  return String(normalizeAdminTableValue(value)).toLowerCase() === filterValue.trim().toLowerCase();
}

function matchesNumberRangeFilter(value: unknown, filterValue: AdminTableFilterRangeValue) {
  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return false;
  }

  const from = filterValue.from?.trim() ? Number(filterValue.from) : undefined;
  const to = filterValue.to?.trim() ? Number(filterValue.to) : undefined;

  if (from !== undefined && !Number.isNaN(from) && numericValue < from) {
    return false;
  }

  if (to !== undefined && !Number.isNaN(to) && numericValue > to) {
    return false;
  }

  return true;
}

export function filterAdminTableRecords<TRecord>(
  records: TRecord[],
  columns: AdminTableColumn<TRecord>[],
  filterValues: AdminTableFilterValues,
) {
  const filterableColumns = columns.filter((column) => getAdminTableFilterConfig(column));

  return records.filter((record) =>
    filterableColumns.every((column) => {
      const filterConfig = getAdminTableFilterConfig(column);
      const filterValue = filterValues[column.key];

      if (!filterConfig || isEmptyFilterValue(filterValue)) {
        return true;
      }

      const cellValue = getAdminTableCellValue(record, column);

      if (filterConfig.type === 'select' && typeof filterValue === 'string') {
        return matchesSelectFilter(cellValue, filterValue);
      }

      if (filterConfig.type === 'numberRange' && isRangeFilterValue(filterValue)) {
        return matchesNumberRangeFilter(cellValue, filterValue);
      }

      return typeof filterValue === 'string'
        ? matchesTextFilter(cellValue, filterValue)
        : true;
    }),
  );
}
