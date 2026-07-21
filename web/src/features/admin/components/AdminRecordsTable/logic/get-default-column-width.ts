import type { AdminTableColumn } from '../types/admin-records-table';

const DEFAULT_COLUMN_WIDTH = 180;
const MIN_COLUMN_WIDTH = 120;

export function getDefaultColumnWidth<TRecord>(column: AdminTableColumn<TRecord>) {
  return column.width ?? DEFAULT_COLUMN_WIDTH;
}

export function getColumnMinWidth<TRecord>(column: AdminTableColumn<TRecord>) {
  return column.minWidth ?? MIN_COLUMN_WIDTH;
}
