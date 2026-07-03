import type {
  AdminTableColumn,
  AdminTableFilterConfig,
} from '../types/admin-records-table';

export function getAdminTableFilterConfig<TRecord>(
  column: AdminTableColumn<TRecord>,
): AdminTableFilterConfig | undefined {
  if (!column.filter) {
    return undefined;
  }

  if (column.filter === true) {
    return {
      type: 'text',
      label: column.title,
    };
  }

  return {
    type: 'text',
    label: column.title,
    ...column.filter,
  };
}
