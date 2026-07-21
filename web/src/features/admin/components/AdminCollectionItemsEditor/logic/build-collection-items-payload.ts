import type { AdminCatalogCollectionItemPayload } from '@/entities/admin';

import type { SelectedCollectionItems } from '../types/admin-collection-items-editor';

export function buildCollectionItemsPayload(
  selectedItems: SelectedCollectionItems,
): AdminCatalogCollectionItemPayload[] {
  return Object.entries(selectedItems)
    .filter(([, item]) => item.selected)
    .map(([id, item]) => ({
      id,
      sortOrder: item.sortOrder,
    }))
    .sort((firstItem, secondItem) => firstItem.sortOrder - secondItem.sortOrder);
}
