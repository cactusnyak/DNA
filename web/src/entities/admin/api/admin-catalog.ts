import type { OrderStatus } from '@/entities/order';
import { httpClient } from '@/shared/api/http-client';

import type {
  AdminCatalogCollection,
  AdminCatalogCollectionItemPayload,
  AdminCatalogCollectionPayload,
  AdminCatalogData,
  AdminCategory,
  AdminCategoryPayload,
  AdminProduct,
  AdminProductPayload,
  AdminUploadImageResponse,
} from '../types/admin-catalog';

function getAdminHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export function getAdminCatalogData(accessToken: string) {
  return httpClient<AdminCatalogData>('/admin/catalog', {
    headers: getAdminHeaders(accessToken),
  });
}

export async function uploadAdminImage(accessToken: string, file: File) {
  const formData = new FormData();

  formData.append('file', file);

  const response = await fetch('/api/admin/uploads/images', {
    method: 'POST',
    headers: getAdminHeaders(accessToken),
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Image upload failed with status ${response.status}`);
  }

  return response.json() as Promise<AdminUploadImageResponse>;
}

export function createAdminCategory(
  accessToken: string,
  payload: AdminCategoryPayload,
) {
  return httpClient<AdminCategory, AdminCategoryPayload>('/admin/categories', {
    method: 'POST',
    body: payload,
    headers: getAdminHeaders(accessToken),
  });
}

export function updateAdminCategory(
  accessToken: string,
  categoryId: string,
  payload: AdminCategoryPayload,
) {
  return httpClient<AdminCategory, AdminCategoryPayload>(
    `/admin/categories/${categoryId}`,
    {
      method: 'PATCH',
      body: payload,
      headers: getAdminHeaders(accessToken),
    },
  );
}

export function deleteAdminCategory(accessToken: string, categoryId: string) {
  return httpClient<void>(`/admin/categories/${categoryId}`, {
    method: 'DELETE',
    headers: getAdminHeaders(accessToken),
  });
}

export function restoreAdminCategory(accessToken: string, categoryId: string) {
  return httpClient<AdminCategory>(`/admin/categories/${categoryId}/restore`, {
    method: 'PATCH',
    headers: getAdminHeaders(accessToken),
  });
}

export function createAdminProduct(
  accessToken: string,
  payload: AdminProductPayload,
) {
  return httpClient<AdminProduct, AdminProductPayload>('/admin/products', {
    method: 'POST',
    body: payload,
    headers: getAdminHeaders(accessToken),
  });
}

export function updateAdminProduct(
  accessToken: string,
  productId: string,
  payload: AdminProductPayload,
) {
  return httpClient<AdminProduct, AdminProductPayload>(
    `/admin/products/${productId}`,
    {
      method: 'PATCH',
      body: payload,
      headers: getAdminHeaders(accessToken),
    },
  );
}

export function deleteAdminProduct(accessToken: string, productId: string) {
  return httpClient<void>(`/admin/products/${productId}`, {
    method: 'DELETE',
    headers: getAdminHeaders(accessToken),
  });
}

export function restoreAdminProduct(accessToken: string, productId: string) {
  return httpClient<AdminProduct>(`/admin/products/${productId}/restore`, {
    method: 'PATCH',
    headers: getAdminHeaders(accessToken),
  });
}

export function createAdminCatalogCollection(
  accessToken: string,
  payload: AdminCatalogCollectionPayload,
) {
  return httpClient<AdminCatalogCollection, AdminCatalogCollectionPayload>(
    '/admin/catalog-collections',
    {
      method: 'POST',
      body: payload,
      headers: getAdminHeaders(accessToken),
    },
  );
}

export function updateAdminCatalogCollection(
  accessToken: string,
  collectionId: string,
  payload: AdminCatalogCollectionPayload,
) {
  return httpClient<AdminCatalogCollection, AdminCatalogCollectionPayload>(
    `/admin/catalog-collections/${collectionId}`,
    {
      method: 'PATCH',
      body: payload,
      headers: getAdminHeaders(accessToken),
    },
  );
}

export function deleteAdminCatalogCollection(
  accessToken: string,
  collectionId: string,
) {
  return httpClient<void>(`/admin/catalog-collections/${collectionId}`, {
    method: 'DELETE',
    headers: getAdminHeaders(accessToken),
  });
}

export function restoreAdminCatalogCollection(
  accessToken: string,
  collectionId: string,
) {
  return httpClient<AdminCatalogCollection>(
    `/admin/catalog-collections/${collectionId}/restore`,
    {
      method: 'PATCH',
      headers: getAdminHeaders(accessToken),
    },
  );
}

export function updateAdminCatalogCollectionCategories(
  accessToken: string,
  collectionId: string,
  items: AdminCatalogCollectionItemPayload[],
) {
  return httpClient<
    AdminCatalogCollection,
    { items: AdminCatalogCollectionItemPayload[] }
  >(`/admin/catalog-collections/${collectionId}/categories`, {
    method: 'PUT',
    body: {
      items,
    },
    headers: getAdminHeaders(accessToken),
  });
}

export function updateAdminCatalogCollectionProducts(
  accessToken: string,
  collectionId: string,
  items: AdminCatalogCollectionItemPayload[],
) {
  return httpClient<
    AdminCatalogCollection,
    { items: AdminCatalogCollectionItemPayload[] }
  >(`/admin/catalog-collections/${collectionId}/products`, {
    method: 'PUT',
    body: {
      items,
    },
    headers: getAdminHeaders(accessToken),
  });
}

export function updateAdminOrderStatus(
  accessToken: string,
  orderId: string,
  status: OrderStatus,
) {
  return httpClient<void, { status: OrderStatus }>(
    `/admin/orders/${orderId}/status`,
    {
      method: 'PATCH',
      body: {
        status,
      },
      headers: getAdminHeaders(accessToken),
    },
  );
}
