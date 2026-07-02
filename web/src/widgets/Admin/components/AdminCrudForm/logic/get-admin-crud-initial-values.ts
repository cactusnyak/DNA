import type {
  AdminCatalogCollection,
  AdminCategory,
  AdminProduct,
} from '@/entities/admin';
import type { Order } from '@/entities/order';

import type { AdminManagementTabId } from '../../../types/admin-management';
import type {
  AdminCrudFormValues,
  AdminCrudRecord,
} from '../types/admin-crud-form';

export function getAdminCrudInitialValues(
  tabId: AdminManagementTabId,
  record?: AdminCrudRecord,
): AdminCrudFormValues {
  if (tabId === 'categories') {
    const category = record as AdminCategory | undefined;

    return {
      name: category?.name ?? '',
      slug: category?.slug ?? '',
      description: category?.description ?? '',
      parentId: category?.parentId ?? '',
      sortOrder: String(category?.sortOrder ?? 0),
      imageUrl: category?.image?.url ?? '',
      imageFile: null,
      imageAlt: category?.image?.alt ?? '',
      isActive: category?.isActive ?? true,
    };
  }

  if (tabId === 'products') {
    const product = record as AdminProduct | undefined;

    return {
      title: product?.title ?? '',
      slug: product?.slug ?? '',
      description: product?.description ?? '',
      categoryId: product?.categoryId ?? '',
      price: String(product?.price ?? 0),
      imageUrls: product?.images.map((image) => image.url) ?? [],
      imageFiles: [],
      isActive: product?.isActive ?? true,
    };
  }

  if (tabId === 'collections') {
    const collection = record as AdminCatalogCollection | undefined;

    return {
      title: collection?.title ?? '',
      slug: collection?.slug ?? '',
      type: collection?.type ?? 'CATEGORY',
      description: collection?.description ?? '',
      isActive: collection?.isActive ?? true,
    };
  }

  const order = record as Order | undefined;

  return {
    status: order?.status ?? 'CREATED',
  };
}
