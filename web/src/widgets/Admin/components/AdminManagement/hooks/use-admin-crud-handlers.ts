import type {
  AdminCatalogCollection,
  AdminCatalogCollectionPayload,
  AdminCategoryPayload,
  AdminProductPayload,
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
    if (activeTabId === 'categories') {
      if (editingRecord) {
        await mutations.updateCategoryMutation.mutateAsync({
          id: editingRecord.id,
          payload: payload as AdminCategoryPayload,
        });
      } else {
        await mutations.createCategoryMutation.mutateAsync(
          payload as AdminCategoryPayload,
        );
      }

      resetEditing();
      return;
    }

    if (activeTabId === 'products') {
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

    if (editingRecord) {
      await mutations.updateOrderStatusMutation.mutateAsync({
        order: editingRecord as Order,
        status: (payload as { status: Order['status'] }).status,
      });
    }

    resetEditing();
  }

  function handleRestore(record: EditableRecord) {
    if (activeTabId === 'categories') {
      mutations.restoreCategoryMutation.mutate(record.id);
    }

    if (activeTabId === 'products') {
      mutations.restoreProductMutation.mutate(record.id);
    }

    if (activeTabId === 'collections') {
      mutations.restoreCollectionMutation.mutate(record.id);
    }
  }

  function handleDelete(record: EditableRecord) {
    if (activeTabId === 'categories') {
      mutations.deleteCategoryMutation.mutate(record.id);
    }

    if (activeTabId === 'products') {
      mutations.deleteProductMutation.mutate(record.id);
    }

    if (activeTabId === 'collections') {
      mutations.deleteCollectionMutation.mutate(record.id);
    }
  }


  function handleHardDelete(record: EditableRecord) {
    if (activeTabId === 'categories') {
      mutations.hardDeleteCategoryMutation.mutate(record.id);
      return;
    }

    if (activeTabId === 'products') {
      mutations.hardDeleteProductMutation.mutate(record.id);
      return;
    }

    if (activeTabId === 'collections') {
      mutations.hardDeleteCollectionMutation.mutate(record.id);
      return;
    }

    mutations.hardDeleteOrderMutation.mutate(record.id);
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

  async function handleQuickCreate(collection: AdminCatalogCollection, title: string) {
    if (collection.type === 'CATEGORY') {
      const category = await mutations.createCategoryMutation.mutateAsync({
        name: title,
        slug: '',
        description: '',
        parentId: '',
        sortOrder: data.categories.length,
        imageUrl: '',
        imageAlt: '',
        isActive: true,
      });

      return category.id;
    }

    if (!data.categories[0]) {
      window.alert('Сначала создайте хотя бы одну категорию.');
      return undefined;
    }

    const product = await mutations.createProductMutation.mutateAsync({
      title,
      slug: '',
      description: '',
      categoryId: data.categories[0].id,
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

