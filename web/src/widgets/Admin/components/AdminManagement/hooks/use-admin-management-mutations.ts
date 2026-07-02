import { useMutation } from '@tanstack/react-query';

import {
  createAdminCatalogCollection,
  createAdminCategory,
  createAdminProduct,
  deleteAdminCatalogCollection,
  deleteAdminCategory,
  deleteAdminProduct,
  restoreAdminCatalogCollection,
  restoreAdminCategory,
  restoreAdminProduct,
  updateAdminCatalogCollection,
  updateAdminCatalogCollectionCategories,
  updateAdminCatalogCollectionProducts,
  updateAdminCategory,
  updateAdminOrderStatus,
  updateAdminProduct,
  type AdminCatalogCollection,
  type AdminCatalogCollectionPayload,
  type AdminCategoryPayload,
  type AdminProductPayload,
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
  const createCategoryMutation = useMutation({
    mutationFn: (payload: AdminCategoryPayload) =>
      createAdminCategory(accessToken, payload),
    onSuccess,
  });

  const updateCategoryMutation = useMutation({
    mutationFn: (params: { id: string; payload: AdminCategoryPayload }) =>
      updateAdminCategory(accessToken, params.id, params.payload),
    onSuccess,
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => deleteAdminCategory(accessToken, id),
    onSuccess,
  });

  const restoreCategoryMutation = useMutation({
    mutationFn: (id: string) => restoreAdminCategory(accessToken, id),
    onSuccess,
  });

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

  const updateOrderStatusMutation = useMutation({
    mutationFn: (params: { order: Order; status: Order['status'] }) =>
      updateAdminOrderStatus(accessToken, params.order.id, params.status),
    onSuccess,
  });

  return {
    createCategoryMutation,
    updateCategoryMutation,
    deleteCategoryMutation,
    restoreCategoryMutation,
    createProductMutation,
    updateProductMutation,
    deleteProductMutation,
    restoreProductMutation,
    createCollectionMutation,
    updateCollectionMutation,
    deleteCollectionMutation,
    restoreCollectionMutation,
    updateCollectionItemsMutation,
    updateOrderStatusMutation,
    isCrudFormPending:
      createCategoryMutation.isPending ||
      updateCategoryMutation.isPending ||
      createProductMutation.isPending ||
      updateProductMutation.isPending ||
      createCollectionMutation.isPending ||
      updateCollectionMutation.isPending ||
      updateOrderStatusMutation.isPending,
  };
}
