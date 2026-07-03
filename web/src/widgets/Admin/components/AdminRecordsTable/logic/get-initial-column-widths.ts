import { getDefaultColumnWidth } from './get-default-column-width';

import type {
  AdminTableColumn,
  AdminTableColumnWidths,
} from '../types/admin-records-table';

export function getInitialColumnWidths<TRecord>(
  columns: AdminTableColumn<TRecord>[],
): AdminTableColumnWidths {
  return columns.reduce<AdminTableColumnWidths>((result, column) => {
    result[column.key] = getDefaultColumnWidth(column);

    return result;
  }, {});
}
