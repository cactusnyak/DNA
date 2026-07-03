import type { AdminTableColumnAlign } from '../types/admin-records-table';

export function getAdminTableAlignClassName(align?: AdminTableColumnAlign) {
  if (align === 'center') {
    return 'text-center';
  }

  if (align === 'right') {
    return 'text-right';
  }

  return 'text-left';
}
