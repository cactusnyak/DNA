import type { OrderStatus } from '@/entities/order';

import type { AdminManagementTabId } from '../../../types/admin-management';
import type {
  AdminCrudFormValues,
  AdminCrudPayload,
} from '../types/admin-crud-form';

export function buildAdminCrudPayload(
  tabId: AdminManagementTabId,
  values: AdminCrudFormValues,
): AdminCrudPayload {
  if (tabId === 'categories') {
    return {
      name: String(values.name ?? ''),
      slug: String(values.slug ?? ''),
      description: String(values.description ?? ''),
      parentId: String(values.parentId ?? ''),
      sortOrder: Number(values.sortOrder ?? 0),
      imageUrl: String(values.imageUrl ?? ''),
      imageAlt: String(values.imageAlt ?? ''),
      isActive: Boolean(values.isActive),
    };
  }

  if (tabId === 'products') {
    return {
      title: String(values.title ?? ''),
      slug: String(values.slug ?? ''),
      description: String(values.description ?? ''),
      categoryId: String(values.categoryId ?? ''),
      price: Number(values.price ?? 0),
      imageUrls: String(values.imageUrls ?? '')
        .split('\n')
        .map((imageUrl) => imageUrl.trim())
        .filter(Boolean),
      isActive: Boolean(values.isActive),
    };
  }

  if (tabId === 'collections') {
    return {
      title: String(values.title ?? ''),
      slug: String(values.slug ?? ''),
      type: values.type === 'PRODUCT' ? 'PRODUCT' : 'CATEGORY',
      description: String(values.description ?? ''),
      isActive: Boolean(values.isActive),
    };
  }

  return {
    status: values.status as OrderStatus,
  };
}
