import type { OrderStatus } from '@/entities/order';
import { httpClient } from '@/shared/api/http-client';

import type {
  AdminAd,
  AdminAdCategory,
  AdminAdCategoryPayload,
  AdminAdPayload,
  AdminCatalogCollection,
  AdminCatalogCollectionItemPayload,
  AdminCatalogCollectionPayload,
  AdminCatalogData,
  AdminMarketCategory,
  AdminMarketCategoryPayload,
  AdminProduct,
  AdminProductPayload,
  AdminUploadImageResponse,
  AdminUser,
  AdminUserRolePayload,
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

// ===== Market categories =====

export function createAdminMarketCategory(
  accessToken: string,
  payload: AdminMarketCategoryPayload,
) {
  return httpClient<AdminMarketCategory, AdminMarketCategoryPayload>(
    '/admin/categories',
    {
      method: 'POST',
      body: payload,
      headers: getAdminHeaders(accessToken),
    },
  );
}

export function updateAdminMarketCategory(
  accessToken: string,
  categoryId: string,
  payload: AdminMarketCategoryPayload,
) {
  return httpClient<AdminMarketCategory, AdminMarketCategoryPayload>(
    `/admin/categories/${categoryId}`,
    {
      method: 'PATCH',
      body: payload,
      headers: getAdminHeaders(accessToken),
    },
  );
}

export function deleteAdminMarketCategory(
  accessToken: string,
  categoryId: string,
) {
  return httpClient<void>(`/admin/categories/${categoryId}`, {
    method: 'DELETE',
    headers: getAdminHeaders(accessToken),
  });
}

export function hardDeleteAdminMarketCategory(
  accessToken: string,
  categoryId: string,
) {
  return httpClient<void>(`/admin/categories/${categoryId}/permanent`, {
    method: 'DELETE',
    headers: getAdminHeaders(accessToken),
  });
}

export function restoreAdminMarketCategory(
  accessToken: string,
  categoryId: string,
) {
  return httpClient<AdminMarketCategory>(
    `/admin/categories/${categoryId}/restore`,
    {
      method: 'PATCH',
      headers: getAdminHeaders(accessToken),
    },
  );
}

// ===== Market products =====

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

export function hardDeleteAdminProduct(accessToken: string, productId: string) {
  return httpClient<void>(`/admin/products/${productId}/permanent`, {
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

// ===== Ad categories =====

export function createAdminAdCategory(
  accessToken: string,
  payload: AdminAdCategoryPayload,
) {
  return httpClient<AdminAdCategory, AdminAdCategoryPayload>(
    '/admin/ad-categories',
    {
      method: 'POST',
      body: payload,
      headers: getAdminHeaders(accessToken),
    },
  );
}

export function updateAdminAdCategory(
  accessToken: string,
  categoryId: string,
  payload: AdminAdCategoryPayload,
) {
  return httpClient<AdminAdCategory, AdminAdCategoryPayload>(
    `/admin/ad-categories/${categoryId}`,
    {
      method: 'PATCH',
      body: payload,
      headers: getAdminHeaders(accessToken),
    },
  );
}

export function deleteAdminAdCategory(accessToken: string, categoryId: string) {
  return httpClient<void>(`/admin/ad-categories/${categoryId}`, {
    method: 'DELETE',
    headers: getAdminHeaders(accessToken),
  });
}

export function hardDeleteAdminAdCategory(
  accessToken: string,
  categoryId: string,
) {
  return httpClient<void>(`/admin/ad-categories/${categoryId}/permanent`, {
    method: 'DELETE',
    headers: getAdminHeaders(accessToken),
  });
}

export function restoreAdminAdCategory(accessToken: string, categoryId: string) {
  return httpClient<AdminAdCategory>(
    `/admin/ad-categories/${categoryId}/restore`,
    {
      method: 'PATCH',
      headers: getAdminHeaders(accessToken),
    },
  );
}

// ===== Ads =====

export function updateAdminAd(
  accessToken: string,
  adId: string,
  payload: AdminAdPayload,
) {
  return httpClient<AdminAd, AdminAdPayload>(`/admin/ads/${adId}`, {
    method: 'PATCH',
    body: payload,
    headers: getAdminHeaders(accessToken),
  });
}

export function deleteAdminAd(accessToken: string, adId: string) {
  return httpClient<void>(`/admin/ads/${adId}`, {
    method: 'DELETE',
    headers: getAdminHeaders(accessToken),
  });
}

export function hardDeleteAdminAd(accessToken: string, adId: string) {
  return httpClient<void>(`/admin/ads/${adId}/permanent`, {
    method: 'DELETE',
    headers: getAdminHeaders(accessToken),
  });
}

export function restoreAdminAd(accessToken: string, adId: string) {
  return httpClient<AdminAd>(`/admin/ads/${adId}/restore`, {
    method: 'PATCH',
    headers: getAdminHeaders(accessToken),
  });
}

// ===== Users =====

export function updateAdminUserRole(
  accessToken: string,
  userId: string,
  payload: AdminUserRolePayload,
) {
  return httpClient<AdminUser, AdminUserRolePayload>(
    `/admin/users/${userId}/role`,
    {
      method: 'PATCH',
      body: payload,
      headers: getAdminHeaders(accessToken),
    },
  );
}

export function deleteAdminUser(accessToken: string, userId: string) {
  return httpClient<void>(`/admin/users/${userId}`, {
    method: 'DELETE',
    headers: getAdminHeaders(accessToken),
  });
}

// ===== Collections =====

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

export function hardDeleteAdminCatalogCollection(
  accessToken: string,
  collectionId: string,
) {
  return httpClient<void>(
    `/admin/catalog-collections/${collectionId}/permanent`,
    {
      method: 'DELETE',
      headers: getAdminHeaders(accessToken),
    },
  );
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

// ===== Bulk operations =====

type BulkIdsPayload = { ids: string[] };
type BulkResult = { deleted?: number; restored?: number };

export function hardDeleteAdminUser(accessToken: string, userId: string) {
  return httpClient<void>(`/admin/users/${userId}/permanent`, {
    method: 'DELETE',
    headers: getAdminHeaders(accessToken),
  });
}

export function bulkDeleteAdminUsers(accessToken: string, ids: string[]) {
  return httpClient<BulkResult, BulkIdsPayload>('/admin/users/bulk', {
    method: 'DELETE',
    body: { ids },
    headers: getAdminHeaders(accessToken),
  });
}

export function bulkHardDeleteAdminUsers(accessToken: string, ids: string[]) {
  return httpClient<BulkResult, BulkIdsPayload>('/admin/users/bulk/permanent', {
    method: 'DELETE',
    body: { ids },
    headers: getAdminHeaders(accessToken),
  });
}

export function bulkDeleteAdminProducts(accessToken: string, ids: string[]) {
  return httpClient<BulkResult, BulkIdsPayload>('/admin/products/bulk', {
    method: 'DELETE',
    body: { ids },
    headers: getAdminHeaders(accessToken),
  });
}

export function bulkHardDeleteAdminProducts(accessToken: string, ids: string[]) {
  return httpClient<BulkResult, BulkIdsPayload>('/admin/products/bulk/permanent', {
    method: 'DELETE',
    body: { ids },
    headers: getAdminHeaders(accessToken),
  });
}

export function bulkRestoreAdminProducts(accessToken: string, ids: string[]) {
  return httpClient<BulkResult, BulkIdsPayload>('/admin/products/bulk/restore', {
    method: 'PATCH',
    body: { ids },
    headers: getAdminHeaders(accessToken),
  });
}

export function bulkDeleteAdminMarketCategories(accessToken: string, ids: string[]) {
  return httpClient<BulkResult, BulkIdsPayload>('/admin/categories/bulk', {
    method: 'DELETE',
    body: { ids },
    headers: getAdminHeaders(accessToken),
  });
}

export function bulkHardDeleteAdminMarketCategories(accessToken: string, ids: string[]) {
  return httpClient<BulkResult, BulkIdsPayload>('/admin/categories/bulk/permanent', {
    method: 'DELETE',
    body: { ids },
    headers: getAdminHeaders(accessToken),
  });
}

export function bulkRestoreAdminMarketCategories(accessToken: string, ids: string[]) {
  return httpClient<BulkResult, BulkIdsPayload>('/admin/categories/bulk/restore', {
    method: 'PATCH',
    body: { ids },
    headers: getAdminHeaders(accessToken),
  });
}

export function bulkDeleteAdminAdCategories(accessToken: string, ids: string[]) {
  return httpClient<BulkResult, BulkIdsPayload>('/admin/ad-categories/bulk', {
    method: 'DELETE',
    body: { ids },
    headers: getAdminHeaders(accessToken),
  });
}

export function bulkHardDeleteAdminAdCategories(accessToken: string, ids: string[]) {
  return httpClient<BulkResult, BulkIdsPayload>('/admin/ad-categories/bulk/permanent', {
    method: 'DELETE',
    body: { ids },
    headers: getAdminHeaders(accessToken),
  });
}

export function bulkRestoreAdminAdCategories(accessToken: string, ids: string[]) {
  return httpClient<BulkResult, BulkIdsPayload>('/admin/ad-categories/bulk/restore', {
    method: 'PATCH',
    body: { ids },
    headers: getAdminHeaders(accessToken),
  });
}

export function bulkDeleteAdminAds(accessToken: string, ids: string[]) {
  return httpClient<BulkResult, BulkIdsPayload>('/admin/ads/bulk', {
    method: 'DELETE',
    body: { ids },
    headers: getAdminHeaders(accessToken),
  });
}

export function bulkHardDeleteAdminAds(accessToken: string, ids: string[]) {
  return httpClient<BulkResult, BulkIdsPayload>('/admin/ads/bulk/permanent', {
    method: 'DELETE',
    body: { ids },
    headers: getAdminHeaders(accessToken),
  });
}

export function bulkRestoreAdminAds(accessToken: string, ids: string[]) {
  return httpClient<BulkResult, BulkIdsPayload>('/admin/ads/bulk/restore', {
    method: 'PATCH',
    body: { ids },
    headers: getAdminHeaders(accessToken),
  });
}

// ===== Orders =====

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

export function hardDeleteAdminOrder(accessToken: string, orderId: string) {
  return httpClient<void>(`/admin/orders/${orderId}`, {
    method: 'DELETE',
    headers: getAdminHeaders(accessToken),
  });
}
