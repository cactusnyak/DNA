import type {
  AdminAd,
  AdminAdCategory,
  AdminCatalogCollection,
  AdminMarketCategory,
  AdminProduct,
  AdminUser,
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
  if (tabId === 'market-categories') {
    const category = record as AdminMarketCategory | undefined;

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

  if (tabId === 'market-products') {
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

  if (tabId === 'ad-categories') {
    const category = record as AdminAdCategory | undefined;

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

  if (tabId === 'ads') {
    const ad = record as AdminAd | undefined;

    return {
      title: ad?.title ?? '',
      slug: ad?.slug ?? '',
      description: ad?.description ?? '',
      categoryId: ad?.categoryId ?? '',
      price: String(ad?.price ?? 0),
      status: ad?.status ?? 'PUBLISHED',
      imageUrls: ad?.images.map((image) => image.url) ?? [],
      imageFiles: [],
      isActive: ad?.isActive ?? true,
    };
  }

  if (tabId === 'users') {
    const user = record as AdminUser | undefined;

    return {
      role: user?.role ?? 'DEFAULT',
    };
  }

  const order = record as Order | undefined;

  return {
    status: order?.status ?? 'CREATED',
  };
}
