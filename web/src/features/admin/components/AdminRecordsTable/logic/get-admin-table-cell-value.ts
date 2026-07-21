import type {
  AdminTableCellValue,
  AdminTableColumn,
} from '../types/admin-records-table';

function isPrimitiveTableValue(value: unknown): value is AdminTableCellValue {
  return (
    value === null ||
    value === undefined ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    value instanceof Date
  );
}

export function getAdminTableCellValue<TRecord>(
  record: TRecord,
  column: AdminTableColumn<TRecord>,
): AdminTableCellValue {
  if (column.getValue) {
    return column.getValue(record);
  }

  const renderedValue = column.render(record);

  return isPrimitiveTableValue(renderedValue) ? renderedValue : '';
}
