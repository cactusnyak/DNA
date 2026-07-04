import type {
  AdminAdCategoryPayload,
  AdminAdPayload,
  AdminCatalogCollection,
  AdminCatalogCollectionPayload,
  AdminMarketCategoryPayload,
  AdminProductPayload,
  AdminUserRolePayload,
} from '@/entities/admin';
import type { Order } from '@/entities/order';

import type { AdminCrudPayload } from '../../AdminCrudForm/types/admin-crud-form';
import type { AdminManagementTabId } from '../../../types/admin-management';
import type {
  AdminCatalogData,
  EditableRecord,
} from '../types/admin-management-records';
import type { useAdminManagementMutations } from './use-admin-management-mutations';

type AdminManagementMutations = ReturnType<typeof useAdminManagementMutations>;

type UseAdminCrudHandlersParams = {
  activeTabId: AdminManagementTabId;
  editingRecord?: EditableRecord;
  data: AdminCatalogData;
  mutations: AdminManagementMutations;
  resetEditing: () => void;
};

export function useAdminCrudHandlers({
  activeTabId,
  editingRecord,
  data,
  mutations,
  resetEditing,
}: UseAdminCrudHandlersParams) {
  async function handleSubmit(payload: AdminCrudPayload) {
    if (activeTabId === 'market-categories') {
      if (editingRecord) {
        await mutations.updateMarketCategoryMutation.mutateAsync({
          id: editingRecord.id,
          payload: payload as AdminMarketCategoryPayload,
        });
      } else {
        await mutations.createMarketCategoryMutation.mutateAsync(
          payload as AdminMarketCategoryPayload,
        );
      }

      resetEditing();
      return;
    }

    if (activeTabId === 'market-products') {
      if (editingRecord) {
        await mutations.updateProductMutation.mutateAsync({
          id: editingRecord.id,
          payload: payload as AdminProductPayload,
        });
      } else {
        await mutations.createProductMutation.mutateAsync(
          payload as AdminProductPayload,
        );
      }

      resetEditing();
      return;
    }

    if (activeTabId === 'collections') {
      if (editingRecord) {
        await mutations.updateCollectionMutation.mutateAsync({
          id: editingRecord.id,
          payload: payload as AdminCatalogCollectionPayload,
        });
      } else {
        await mutations.createCollectionMutation.mutateAsync(
          payload as AdminCatalogCollectionPayload,
        );
      }

      resetEditing();
      return;
    }

    if (activeTabId === 'ad-categories') {
      if (editingRecord) {
        await mutations.updateAdCategoryMutation.mutateAsync({
          id: editingRecord.id,
          payload: payload as AdminAdCategoryPayload,
        });
      } else {
        await mutations.createAdCategoryMutation.mutateAsync(
          payload as AdminAdCategoryPayload,
        );
      }

      resetEditing();
      return;
    }

    if (activeTabId === 'ads') {
      if (editingRecord) {
        await mutations.updateAdMutation.mutateAsync({
          id: editingRecord.id,
          payload: payload as AdminAdPayload,
        });
      }

      resetEditing();
      return;
    }

    if (activeTabId === 'users') {
      if (editingRecord) {
        await mutations.updateUserRoleMutation.mutateAsync({
          id: editingRecord.id,
          payload: payload as AdminUserRolePayload,
        });
      }

      resetEditing();
      return;
    }

    if (editingRecord) {
      await mutations.updateOrderStatusMutation.mutateAsync({
        order: editingRecord as Order,
        status: (payload as { status: Order['status'] }).status,
      });
    }

    resetEditing();
  }

  function handleRestore(record: EditableRecord) {
    if (activeTabId === 'market-categories') {
      mutations.restoreMarketCategoryMutation.mutate(record.id);
    }

    if (activeTabId === 'market-products') {
      mutations.restoreProductMutation.mutate(record.id);
    }

    if (activeTabId === 'collections') {
      mutations.restoreCollectionMutation.mutate(record.id);
    }

    if (activeTabId === 'ad-categories') {
      mutations.restoreAdCategoryMutation.mutate(record.id);
    }

    if (activeTabId === 'ads') {
      mutations.restoreAdMutation.mutate(record.id);
    }
  }

  function handleDelete(record: EditableRecord) {
    if (activeTabId === 'market-categories') {
      mutations.deleteMarketCategoryMutation.mutate(record.id);
    }

    if (activeTabId === 'market-products') {
      mutations.deleteProductMutation.mutate(record.id);
    }

    if (activeTabId === 'collections') {
      mutations.deleteCollectionMutation.mutate(record.id);
    }

    if (activeTabId === 'ad-categories') {
      mutations.deleteAdCategoryMutation.mutate(record.id);
    }

    if (activeTabId === 'ads') {
      mutations.deleteAdMutation.mutate(record.id);
    }

    if (activeTabId === 'users') {
      mutations.deleteUserMutation.mutate(record.id);
    }
  }

  function handleHardDelete(record: EditableRecord) {
    if (activeTabId === 'market-categories') {
      mutations.hardDeleteMarketCategoryMutation.mutate(record.id);
      return;
    }

    if (activeTabId === 'market-products') {
      mutations.hardDeleteProductMutation.mutate(record.id);
      return;
    }

    if (activeTabId === 'collections') {
      mutations.hardDeleteCollectionMutation.mutate(record.id);
      return;
    }

    if (activeTabId === 'ad-categories') {
      mutations.hardDeleteAdCategoryMutation.mutate(record.id);
      return;
    }

    if (activeTabId === 'ads') {
      mutations.hardDeleteAdMutation.mutate(record.id);
      return;
    }

    if (activeTabId === 'orders') {
      mutations.hardDeleteOrderMutation.mutate(record.id);
    }
  }

  function handleCollectionItemsSave(
    collection: AdminCatalogCollection,
    items: { id: string; sortOrder: number }[],
  ) {
    mutations.updateCollectionItemsMutation.mutate({
      collection,
      items,
    });
  }

  async function handleQuickCreate(
    collection: AdminCatalogCollection,
    title: string,
  ) {
    if (collection.type === 'CATEGORY') {
      const category = await mutations.createMarketCategoryMutation.mutateAsync({
        name: title,
        slug: '',
        description: '',
        parentId: '',
        sortOrder: data.marketCategories.length,
        imageUrl: '',
        imageAlt: '',
        isActive: true,
      });

      return category.id;
    }

    if (!data.marketCategories[0]) {
      window.alert('Сначала создайте хотя бы одну категорию маркета.');
      return undefined;
    }

    const product = await mutations.createProductMutation.mutateAsync({
      title,
      slug: '',
      description: '',
      categoryId: data.marketCategories[0].id,
      price: 0,
      imageUrls: [],
      isActive: true,
    });

    return product.id;
  }

  return {
    handleSubmit,
    handleRestore,
    handleDelete,
    handleHardDelete,
    handleCollectionItemsSave,
    handleQuickCreate,
  };
}
