import { useMutation } from '@tanstack/react-query';

import {
  bulkDeleteAdminAdCategories,
  bulkDeleteAdminAds,
  bulkDeleteAdminMarketCategories,
  bulkDeleteAdminProducts,
  bulkDeleteAdminUsers,
  bulkHardDeleteAdminUsers,
  hardDeleteAdminUser,
  bulkHardDeleteAdminAdCategories,
  bulkHardDeleteAdminAds,
  bulkHardDeleteAdminMarketCategories,
  bulkHardDeleteAdminProducts,
  bulkRestoreAdminAdCategories,
  bulkRestoreAdminAds,
  bulkRestoreAdminMarketCategories,
  bulkRestoreAdminProducts,
  createAdminAdCategory,
  createAdminCatalogCollection,
  createAdminMarketCategory,
  createAdminProduct,
  deleteAdminAd,
  deleteAdminAdCategory,
  deleteAdminCatalogCollection,
  deleteAdminMarketCategory,
  deleteAdminProduct,
  deleteAdminUser,
  hardDeleteAdminAd,
  hardDeleteAdminAdCategory,
  hardDeleteAdminCatalogCollection,
  hardDeleteAdminMarketCategory,
  hardDeleteAdminOrder,
  hardDeleteAdminProduct,
  restoreAdminAd,
  restoreAdminAdCategory,
  restoreAdminCatalogCollection,
  restoreAdminMarketCategory,
  restoreAdminProduct,
  updateAdminAd,
  updateAdminAdCategory,
  updateAdminCatalogCollection,
  updateAdminCatalogCollectionCategories,
  updateAdminCatalogCollectionProducts,
  updateAdminMarketCategory,
  updateAdminOrderStatus,
  updateAdminProduct,
  updateAdminUserRole,
  type AdminAdCategoryPayload,
  type AdminAdPayload,
  type AdminCatalogCollection,
  type AdminCatalogCollectionPayload,
  type AdminMarketCategoryPayload,
  type AdminProductPayload,
  type AdminUserRolePayload,
} from '@/entities/admin';
import type { Order } from '@/entities/order';

type UseAdminManagementMutationsParams = {
  accessToken: string;
  onSuccess: () => void;
};

export function useAdminManagementMutations({
  accessToken,
  onSuccess,
}: UseAdminManagementMutationsParams) {
  // ===== Market categories =====
  const createMarketCategoryMutation = useMutation({
    mutationFn: (payload: AdminMarketCategoryPayload) =>
      createAdminMarketCategory(accessToken, payload),
    onSuccess,
  });

  const updateMarketCategoryMutation = useMutation({
    mutationFn: (params: { id: string; payload: AdminMarketCategoryPayload }) =>
      updateAdminMarketCategory(accessToken, params.id, params.payload),
    onSuccess,
  });

  const deleteMarketCategoryMutation = useMutation({
    mutationFn: (id: string) => deleteAdminMarketCategory(accessToken, id),
    onSuccess,
  });

  const restoreMarketCategoryMutation = useMutation({
    mutationFn: (id: string) => restoreAdminMarketCategory(accessToken, id),
    onSuccess,
  });

  const hardDeleteMarketCategoryMutation = useMutation({
    mutationFn: (id: string) => hardDeleteAdminMarketCategory(accessToken, id),
    onSuccess,
  });

  // ===== Market products =====
  const createProductMutation = useMutation({
    mutationFn: (payload: AdminProductPayload) =>
      createAdminProduct(accessToken, payload),
    onSuccess,
  });

  const updateProductMutation = useMutation({
    mutationFn: (params: { id: string; payload: AdminProductPayload }) =>
      updateAdminProduct(accessToken, params.id, params.payload),
    onSuccess,
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => deleteAdminProduct(accessToken, id),
    onSuccess,
  });

  const restoreProductMutation = useMutation({
    mutationFn: (id: string) => restoreAdminProduct(accessToken, id),
    onSuccess,
  });

  const hardDeleteProductMutation = useMutation({
    mutationFn: (id: string) => hardDeleteAdminProduct(accessToken, id),
    onSuccess,
  });

  // ===== Collections =====
  const createCollectionMutation = useMutation({
    mutationFn: (payload: AdminCatalogCollectionPayload) =>
      createAdminCatalogCollection(accessToken, payload),
    onSuccess,
  });

  const updateCollectionMutation = useMutation({
    mutationFn: (params: {
      id: string;
      payload: AdminCatalogCollectionPayload;
    }) => updateAdminCatalogCollection(accessToken, params.id, params.payload),
    onSuccess,
  });

  const deleteCollectionMutation = useMutation({
    mutationFn: (id: string) => deleteAdminCatalogCollection(accessToken, id),
    onSuccess,
  });

  const restoreCollectionMutation = useMutation({
    mutationFn: (id: string) => restoreAdminCatalogCollection(accessToken, id),
    onSuccess,
  });

  const hardDeleteCollectionMutation = useMutation({
    mutationFn: (id: string) =>
      hardDeleteAdminCatalogCollection(accessToken, id),
    onSuccess,
  });

  const updateCollectionItemsMutation = useMutation({
    mutationFn: (params: {
      collection: AdminCatalogCollection;
      items: { id: string; sortOrder: number }[];
    }) =>
      params.collection.type === 'CATEGORY'
        ? updateAdminCatalogCollectionCategories(
          accessToken,
          params.collection.id,
          params.items,
        )
        : updateAdminCatalogCollectionProducts(
          accessToken,
          params.collection.id,
          params.items,
        ),
    onSuccess,
  });

  // ===== Orders =====
  const updateOrderStatusMutation = useMutation({
    mutationFn: (params: { order: Order; status: Order['status'] }) =>
      updateAdminOrderStatus(accessToken, params.order.id, params.status),
    onSuccess,
  });

  const hardDeleteOrderMutation = useMutation({
    mutationFn: (id: string) => hardDeleteAdminOrder(accessToken, id),
    onSuccess,
  });

  // ===== Ad categories =====
  const createAdCategoryMutation = useMutation({
    mutationFn: (payload: AdminAdCategoryPayload) =>
      createAdminAdCategory(accessToken, payload),
    onSuccess,
  });

  const updateAdCategoryMutation = useMutation({
    mutationFn: (params: { id: string; payload: AdminAdCategoryPayload }) =>
      updateAdminAdCategory(accessToken, params.id, params.payload),
    onSuccess,
  });

  const deleteAdCategoryMutation = useMutation({
    mutationFn: (id: string) => deleteAdminAdCategory(accessToken, id),
    onSuccess,
  });

  const restoreAdCategoryMutation = useMutation({
    mutationFn: (id: string) => restoreAdminAdCategory(accessToken, id),
    onSuccess,
  });

  const hardDeleteAdCategoryMutation = useMutation({
    mutationFn: (id: string) => hardDeleteAdminAdCategory(accessToken, id),
    onSuccess,
  });

  // ===== Ads =====
  const updateAdMutation = useMutation({
    mutationFn: (params: { id: string; payload: AdminAdPayload }) =>
      updateAdminAd(accessToken, params.id, params.payload),
    onSuccess,
  });

  const deleteAdMutation = useMutation({
    mutationFn: (id: string) => deleteAdminAd(accessToken, id),
    onSuccess,
  });

  const restoreAdMutation = useMutation({
    mutationFn: (id: string) => restoreAdminAd(accessToken, id),
    onSuccess,
  });

  const hardDeleteAdMutation = useMutation({
    mutationFn: (id: string) => hardDeleteAdminAd(accessToken, id),
    onSuccess,
  });

  // ===== Users =====
  const updateUserRoleMutation = useMutation({
    mutationFn: (params: { id: string; payload: AdminUserRolePayload }) =>
      updateAdminUserRole(accessToken, params.id, params.payload),
    onSuccess,
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => deleteAdminUser(accessToken, id),
    onSuccess,
  });

  const hardDeleteUserMutation = useMutation({
    mutationFn: (id: string) => hardDeleteAdminUser(accessToken, id),
    onSuccess,
  });

  // ===== Bulk =====
  const bulkDeleteUsersMutation = useMutation({
    mutationFn: (ids: string[]) => bulkDeleteAdminUsers(accessToken, ids),
    onSuccess,
  });

  const bulkHardDeleteUsersMutation = useMutation({
    mutationFn: (ids: string[]) => bulkHardDeleteAdminUsers(accessToken, ids),
    onSuccess,
  });

  const bulkDeleteProductsMutation = useMutation({
    mutationFn: (ids: string[]) => bulkDeleteAdminProducts(accessToken, ids),
    onSuccess,
  });

  const bulkHardDeleteProductsMutation = useMutation({
    mutationFn: (ids: string[]) => bulkHardDeleteAdminProducts(accessToken, ids),
    onSuccess,
  });

  const bulkRestoreProductsMutation = useMutation({
    mutationFn: (ids: string[]) => bulkRestoreAdminProducts(accessToken, ids),
    onSuccess,
  });

  const bulkDeleteMarketCategoriesMutation = useMutation({
    mutationFn: (ids: string[]) => bulkDeleteAdminMarketCategories(accessToken, ids),
    onSuccess,
  });

  const bulkHardDeleteMarketCategoriesMutation = useMutation({
    mutationFn: (ids: string[]) => bulkHardDeleteAdminMarketCategories(accessToken, ids),
    onSuccess,
  });

  const bulkRestoreMarketCategoriesMutation = useMutation({
    mutationFn: (ids: string[]) => bulkRestoreAdminMarketCategories(accessToken, ids),
    onSuccess,
  });

  const bulkDeleteAdCategoriesMutation = useMutation({
    mutationFn: (ids: string[]) => bulkDeleteAdminAdCategories(accessToken, ids),
    onSuccess,
  });

  const bulkHardDeleteAdCategoriesMutation = useMutation({
    mutationFn: (ids: string[]) => bulkHardDeleteAdminAdCategories(accessToken, ids),
    onSuccess,
  });

  const bulkRestoreAdCategoriesMutation = useMutation({
    mutationFn: (ids: string[]) => bulkRestoreAdminAdCategories(accessToken, ids),
    onSuccess,
  });

  const bulkDeleteAdsMutation = useMutation({
    mutationFn: (ids: string[]) => bulkDeleteAdminAds(accessToken, ids),
    onSuccess,
  });

  const bulkHardDeleteAdsMutation = useMutation({
    mutationFn: (ids: string[]) => bulkHardDeleteAdminAds(accessToken, ids),
    onSuccess,
  });

  const bulkRestoreAdsMutation = useMutation({
    mutationFn: (ids: string[]) => bulkRestoreAdminAds(accessToken, ids),
    onSuccess,
  });

  return {
    createMarketCategoryMutation,
    updateMarketCategoryMutation,
    deleteMarketCategoryMutation,
    restoreMarketCategoryMutation,
    hardDeleteMarketCategoryMutation,
    createProductMutation,
    updateProductMutation,
    deleteProductMutation,
    restoreProductMutation,
    hardDeleteProductMutation,
    createCollectionMutation,
    updateCollectionMutation,
    deleteCollectionMutation,
    restoreCollectionMutation,
    hardDeleteCollectionMutation,
    updateCollectionItemsMutation,
    updateOrderStatusMutation,
    hardDeleteOrderMutation,
    createAdCategoryMutation,
    updateAdCategoryMutation,
    deleteAdCategoryMutation,
    restoreAdCategoryMutation,
    hardDeleteAdCategoryMutation,
    updateAdMutation,
    deleteAdMutation,
    restoreAdMutation,
    hardDeleteAdMutation,
    updateUserRoleMutation,
    deleteUserMutation,
    hardDeleteUserMutation,
    bulkDeleteUsersMutation,
    bulkHardDeleteUsersMutation,
    bulkDeleteProductsMutation,
    bulkHardDeleteProductsMutation,
    bulkRestoreProductsMutation,
    bulkDeleteMarketCategoriesMutation,
    bulkHardDeleteMarketCategoriesMutation,
    bulkRestoreMarketCategoriesMutation,
    bulkDeleteAdCategoriesMutation,
    bulkHardDeleteAdCategoriesMutation,
    bulkRestoreAdCategoriesMutation,
    bulkDeleteAdsMutation,
    bulkHardDeleteAdsMutation,
    bulkRestoreAdsMutation,
    isCrudFormPending:
      createMarketCategoryMutation.isPending ||
      updateMarketCategoryMutation.isPending ||
      createProductMutation.isPending ||
      updateProductMutation.isPending ||
      createCollectionMutation.isPending ||
      updateCollectionMutation.isPending ||
      updateOrderStatusMutation.isPending ||
      createAdCategoryMutation.isPending ||
      updateAdCategoryMutation.isPending ||
      updateAdMutation.isPending ||
      updateUserRoleMutation.isPending,
  };
}
