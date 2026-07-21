import type { EditableRecord } from '../types/admin-management-records';

export function canRestoreAdminRecord(record: EditableRecord) {
  if ('deletedAt' in record) {
    return Boolean(record.deletedAt);
  }

  if ('isActive' in record) {
    return record.isActive === false;
  }

  return false;
}
