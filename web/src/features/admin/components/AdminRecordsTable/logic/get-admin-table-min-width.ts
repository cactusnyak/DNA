import { getDefaultColumnWidth } from './get-default-column-width';

import type {
  AdminTableColumn,
  AdminTableColumnWidths,
} from '../types/admin-records-table';

type GetAdminTableMinWidthParams<TRecord> = {
  columns: AdminTableColumn<TRecord>[];
  columnWidths: AdminTableColumnWidths;
  hasActions: boolean;
  actionsColumnWidth?: number;
};

const DEFAULT_ACTIONS_COLUMN_WIDTH = 180;

export function getAdminTableMinWidth<TRecord>({
  columns,
  columnWidths,
  hasActions,
  actionsColumnWidth = DEFAULT_ACTIONS_COLUMN_WIDTH,
}: GetAdminTableMinWidthParams<TRecord>) {
  const columnsWidth = columns.reduce(
    (sum, column) =>
      sum + (columnWidths[column.key] ?? getDefaultColumnWidth(column)),
    0,
  );

  return columnsWidth + (hasActions ? actionsColumnWidth : 0);
}
