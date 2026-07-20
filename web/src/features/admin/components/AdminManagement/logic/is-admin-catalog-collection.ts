import type { AdminCatalogCollection } from '@/entities/admin';

import type { EditableRecord } from '../types/admin-management-records';

export function isAdminCatalogCollection(
  record?: EditableRecord,
): record is AdminCatalogCollection {
  return Boolean(record && 'type' in record);
}
