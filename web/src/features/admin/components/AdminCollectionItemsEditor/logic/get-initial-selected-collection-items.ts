import type { AdminCatalogCollection } from '@/entities/admin';

import type { SelectedCollectionItems } from '../types/admin-collection-items-editor';

export function getInitialSelectedCollectionItems(
  collection: AdminCatalogCollection,
): SelectedCollectionItems {
  const result: SelectedCollectionItems = {};

  if (collection.type === 'CATEGORY') {
    collection.categories.forEach((item, index) => {
      result[item.category.id] = {
        selected: true,
        sortOrder: item.sortOrder ?? index,
      };
    });

    return result;
  }

  collection.products.forEach((item, index) => {
    result[item.product.id] = {
      selected: true,
      sortOrder: item.sortOrder ?? index,
    };
  });

  return result;
}
