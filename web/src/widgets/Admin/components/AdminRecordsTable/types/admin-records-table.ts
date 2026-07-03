import type { PointerEvent, ReactNode } from 'react';

export type AdminTableCellValue =
  | string
  | number
  | boolean
  | Date
  | null
  | undefined;

export type AdminTableSortDirection = 'asc' | 'desc';

export type AdminTableSortState = {
  key: string;
  direction: AdminTableSortDirection;
} | null;

export type AdminTableFilterType = 'text' | 'select' | 'numberRange';

export type AdminTableSelectFilterOption = {
  value: string;
  label: ReactNode;
};

export type AdminTableFilterConfig = {
  type?: AdminTableFilterType;
  label?: ReactNode;
  placeholder?: string;
  options?: AdminTableSelectFilterOption[];
};

export type AdminTableFilterRangeValue = {
  from?: string;
  to?: string;
};

export type AdminTableFilterValue = string | AdminTableFilterRangeValue;

export type AdminTableFilterValues = Record<
  string,
  AdminTableFilterValue | undefined
>;

export type AdminTableColumnAlign = 'left' | 'center' | 'right';

export type AdminTableColumn<TRecord> = {
  key: string;
  title: ReactNode;
  render: (record: TRecord) => ReactNode;
  getValue?: (record: TRecord) => AdminTableCellValue;
  sortable?: boolean;
  filter?: boolean | AdminTableFilterConfig;
  width?: number;
  minWidth?: number;
  align?: AdminTableColumnAlign;
};

export type DeletedAwareRecord = {
  deletedAt?: string | Date | null;
};

export type AdminTableColumnWidths = Record<string, number>;

export type AdminTableResizeColumnHandler<TRecord> = (
  event: PointerEvent<HTMLSpanElement>,
  column: AdminTableColumn<TRecord>,
) => void;

export type AdminRecordsTableProps<TRecord extends DeletedAwareRecord> = {
  records: TRecord[];
  columns: AdminTableColumn<TRecord>[];
  getRecordKey: (record: TRecord) => string;
  renderActions?: (record: TRecord) => ReactNode;
  emptyText: ReactNode;
};
