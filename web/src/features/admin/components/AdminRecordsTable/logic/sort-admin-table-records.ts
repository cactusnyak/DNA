import { getAdminTableCellValue } from './get-admin-table-cell-value';
import { normalizeAdminTableValue } from './normalize-admin-table-value';

import type {
  AdminTableColumn,
  AdminTableSortState,
} from '../types/admin-records-table';

function compareAdminTableValues(firstValue: unknown, secondValue: unknown) {
  const normalizedFirstValue = normalizeAdminTableValue(firstValue);
  const normalizedSecondValue = normalizeAdminTableValue(secondValue);

  if (
    typeof normalizedFirstValue === 'number' &&
    typeof normalizedSecondValue === 'number'
  ) {
    return normalizedFirstValue - normalizedSecondValue;
  }

  return String(normalizedFirstValue).localeCompare(
    String(normalizedSecondValue),
    'ru',
    {
      numeric: true,
      sensitivity: 'base',
    },
  );
}

export function sortAdminTableRecords<TRecord>(
  records: TRecord[],
  columns: AdminTableColumn<TRecord>[],
  sortState: AdminTableSortState,
) {
  if (!sortState) {
    return records;
  }

  const column = columns.find((item) => item.key === sortState.key);

  if (!column?.sortable) {
    return records;
  }

  return [...records].sort((firstRecord, secondRecord) => {
    const compareResult = compareAdminTableValues(
      getAdminTableCellValue(firstRecord, column),
      getAdminTableCellValue(secondRecord, column),
    );

    return sortState.direction === 'asc' ? compareResult : -compareResult;
  });
}
