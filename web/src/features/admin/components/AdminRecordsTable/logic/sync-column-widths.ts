import { getDefaultColumnWidth } from './get-default-column-width';

import type {
  AdminTableColumn,
  AdminTableColumnWidths,
} from '../types/admin-records-table';

export function syncColumnWidths<TRecord>(
  columns: AdminTableColumn<TRecord>[],
  currentWidths: AdminTableColumnWidths,
): AdminTableColumnWidths {
  const nextWidths = { ...currentWidths };

  columns.forEach((column) => {
    if (!nextWidths[column.key]) {
      nextWidths[column.key] = getDefaultColumnWidth(column);
    }
  });

  Object.keys(nextWidths).forEach((columnKey) => {
    const hasColumn = columns.some((column) => column.key === columnKey);

    if (!hasColumn) {
      delete nextWidths[columnKey];
    }
  });

  return nextWidths;
}
