import {
  useMemo,
  useState,
} from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { Pencil, RotateCcw, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import {
  createAdminCatalogCollection,
  createAdminCategory,
  createAdminProduct,
  deleteAdminCatalogCollection,
  deleteAdminCategory,
  deleteAdminProduct,
  getAdminCatalogData,
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
  type AdminCategory,
  type AdminCategoryPayload,
  type AdminProduct,
  type AdminProductPayload,
} from '@/entities/admin';
import type { Order } from '@/entities/order';
import { formatOrderStatus } from '@/entities/order';
import { formatPrice } from '@/shared/utils/format-price';

import { AdminCategoryTreeView } from '../AdminCategoryTreeView';
import { AdminCollectionItemsEditor } from '../AdminCollectionItemsEditor';
import { AdminCrudForm } from '../AdminCrudForm';
import { AdminRecordsList } from '../AdminRecordsList';
import { AdminRecordsTable } from '../AdminRecordsTable';
import { AdminTabs } from '../AdminTabs';
import { AdminToolbar } from '../AdminToolbar';

import { adminManagementTabs } from '../../data/admin-management-tabs';
import { filterAdminRecords } from '../../logic/filter-admin-records';
import { renderHighlightedText } from '../../logic/render-highlighted-text';
import type {
  AdminManagementTabId,
  AdminViewMode,
} from '../../types/admin-management';

type AdminManagementProps = {
  accessToken: string;
};

type EditableRecord =
  | AdminCategory
  | AdminProduct
  | AdminCatalogCollection
  | Order;

function getStatusLabel(record: {
  isActive?: boolean;
  deletedAt?: string | null;
}) {
  if (record.deletedAt) {
    return 'Удалено';
  }

  return record.isActive === false ? 'Неактивно' : 'Активно';
}

export function AdminManagement({ accessToken }: AdminManagementProps) {
  const queryClient = useQueryClient();

  const [activeTabId, setActiveTabId] =
    useState<AdminManagementTabId>('categories');
  const [searchValue, setSearchValue] = useState('');
  const [viewMode, setViewMode] = useState<AdminViewMode>('table');
  const [editingRecord, setEditingRecord] = useState<EditableRecord>();
  const [isCreating, setIsCreating] = useState(false);

  const {
    data,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['admin-catalog', accessToken],
    queryFn: () => getAdminCatalogData(accessToken),
  });

  function refreshAdminData() {
    queryClient.invalidateQueries({
      queryKey: ['admin-catalog', accessToken],
    });
    queryClient.invalidateQueries({
      queryKey: ['admin-overview', accessToken],
    });
  }

  const createCategoryMutation = useMutation({
    mutationFn: (payload: AdminCategoryPayload) =>
      createAdminCategory(accessToken, payload),
    onSuccess: refreshAdminData,
  });

  const updateCategoryMutation = useMutation({
    mutationFn: (params: { id: string; payload: AdminCategoryPayload }) =>
      updateAdminCategory(accessToken, params.id, params.payload),
    onSuccess: refreshAdminData,
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => deleteAdminCategory(accessToken, id),
    onSuccess: refreshAdminData,
  });

  const restoreCategoryMutation = useMutation({
    mutationFn: (id: string) => restoreAdminCategory(accessToken, id),
    onSuccess: refreshAdminData,
  });

  const createProductMutation = useMutation({
    mutationFn: (payload: AdminProductPayload) =>
      createAdminProduct(accessToken, payload),
    onSuccess: refreshAdminData,
  });

  const updateProductMutation = useMutation({
    mutationFn: (params: { id: string; payload: AdminProductPayload }) =>
      updateAdminProduct(accessToken, params.id, params.payload),
    onSuccess: refreshAdminData,
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => deleteAdminProduct(accessToken, id),
    onSuccess: refreshAdminData,
  });

  const restoreProductMutation = useMutation({
    mutationFn: (id: string) => restoreAdminProduct(accessToken, id),
    onSuccess: refreshAdminData,
  });

  const createCollectionMutation = useMutation({
    mutationFn: (payload: AdminCatalogCollectionPayload) =>
      createAdminCatalogCollection(accessToken, payload),
    onSuccess: refreshAdminData,
  });

  const updateCollectionMutation = useMutation({
    mutationFn: (params: {
      id: string;
      payload: AdminCatalogCollectionPayload;
    }) => updateAdminCatalogCollection(accessToken, params.id, params.payload),
    onSuccess: refreshAdminData,
  });

  const deleteCollectionMutation = useMutation({
    mutationFn: (id: string) => deleteAdminCatalogCollection(accessToken, id),
    onSuccess: refreshAdminData,
  });

  const restoreCollectionMutation = useMutation({
    mutationFn: (id: string) => restoreAdminCatalogCollection(accessToken, id),
    onSuccess: refreshAdminData,
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
    onSuccess: refreshAdminData,
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: (params: { order: Order; status: Order['status'] }) =>
      updateAdminOrderStatus(accessToken, params.order.id, params.status),
    onSuccess: refreshAdminData,
  });

  const counts = {
    categories: data?.categories.length ?? 0,
    products: data?.products.length ?? 0,
    collections: data?.collections.length ?? 0,
    orders: data?.orders.length ?? 0,
  };

  const activeTab = adminManagementTabs.find((tab) => tab.id === activeTabId);

  const filteredCategories = useMemo(
    () =>
      filterAdminRecords(data?.categories ?? [], searchValue, (category) => [
        category.name,
        category.slug,
        category.path,
        category.description,
      ]),
    [data?.categories, searchValue],
  );

  const filteredProducts = useMemo(
    () =>
      filterAdminRecords(data?.products ?? [], searchValue, (product) => [
        product.title,
        product.slug,
        product.description,
        product.price,
        product.category?.name,
      ]),
    [data?.products, searchValue],
  );

  const filteredCollections = useMemo(
    () =>
      filterAdminRecords(data?.collections ?? [], searchValue, (collection) => [
        collection.title,
        collection.slug,
        collection.description,
        collection.type,
      ]),
    [data?.collections, searchValue],
  );

  const filteredOrders = useMemo(
    () =>
      filterAdminRecords(data?.orders ?? [], searchValue, (order) => [
        order.id,
        order.customerName,
        order.customerPhone,
        order.customerEmail,
        order.deliveryAddress,
        order.status,
        order.totalAmount,
      ]),
    [data?.orders, searchValue],
  );

  function resetEditing() {
    setEditingRecord(undefined);
    setIsCreating(false);
  }

  function handleTabChange(tabId: AdminManagementTabId) {
    setActiveTabId(tabId);
    setSearchValue('');
    setViewMode(tabId === 'categories' ? 'tree' : 'table');
    resetEditing();
  }

  function handleEdit(record: EditableRecord) {
    setEditingRecord(record);
    setIsCreating(false);
  }

  async function handleSubmit(payload: unknown) {
    if (activeTabId === 'categories') {
      if (editingRecord) {
        await updateCategoryMutation.mutateAsync({
          id: editingRecord.id,
          payload: payload as AdminCategoryPayload,
        });
      } else {
        await createCategoryMutation.mutateAsync(payload as AdminCategoryPayload);
      }

      resetEditing();
      return;
    }

    if (activeTabId === 'products') {
      if (editingRecord) {
        await updateProductMutation.mutateAsync({
          id: editingRecord.id,
          payload: payload as AdminProductPayload,
        });
      } else {
        await createProductMutation.mutateAsync(payload as AdminProductPayload);
      }

      resetEditing();
      return;
    }

    if (activeTabId === 'collections') {
      if (editingRecord) {
        await updateCollectionMutation.mutateAsync({
          id: editingRecord.id,
          payload: payload as AdminCatalogCollectionPayload,
        });
      } else {
        await createCollectionMutation.mutateAsync(
          payload as AdminCatalogCollectionPayload,
        );
      }

      resetEditing();
      return;
    }

    if (editingRecord) {
      await updateOrderStatusMutation.mutateAsync({
        order: editingRecord as Order,
        status: (payload as { status: Order['status'] }).status,
      });
    }

    resetEditing();
  }

  function renderActions(record: EditableRecord) {
    const canRestore =
      'deletedAt' in record
        ? Boolean(record.deletedAt)
        : 'isActive' in record
          ? record.isActive === false
          : false;

    return (
      <div className="flex flex-wrap justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleEdit(record)}
        >
          <Pencil className="size-3.5" />
          {activeTabId === 'orders' ? 'Статус' : 'Изменить'}
        </Button>

        {activeTabId !== 'orders' && canRestore && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (activeTabId === 'categories') {
                restoreCategoryMutation.mutate(record.id);
              }

              if (activeTabId === 'products') {
                restoreProductMutation.mutate(record.id);
              }

              if (activeTabId === 'collections') {
                restoreCollectionMutation.mutate(record.id);
              }
            }}
          >
            <RotateCcw className="size-3.5" />
            Вернуть
          </Button>
        )}

        {activeTabId !== 'orders' && !canRestore && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => {
              if (!window.confirm('Удалить запись?')) {
                return;
              }

              if (activeTabId === 'categories') {
                deleteCategoryMutation.mutate(record.id);
              }

              if (activeTabId === 'products') {
                deleteProductMutation.mutate(record.id);
              }

              if (activeTabId === 'collections') {
                deleteCollectionMutation.mutate(record.id);
              }
            }}
          >
            <Trash2 className="size-3.5" />
            Удалить
          </Button>
        )}
      </div>
    );
  }

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Загружаем админку...</p>;
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-destructive/20 p-5">
        <p className="text-sm text-destructive">
          Не удалось загрузить данные управления.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <AdminTabs
        tabs={adminManagementTabs}
        activeTabId={activeTabId}
        counts={counts}
        onTabChange={handleTabChange}
      />

      <AdminToolbar
        searchValue={searchValue}
        viewMode={viewMode}
        canUseTree={activeTabId === 'categories'}
        canCreate={activeTabId !== 'orders'}
        createLabel={activeTab?.createLabel}
        onSearchChange={setSearchValue}
        onViewModeChange={setViewMode}
        onCreateClick={() => {
          setIsCreating(true);
          setEditingRecord(undefined);
        }}
      />

      {(isCreating || editingRecord) && (
        <AdminCrudForm
          tabId={activeTabId}
          record={editingRecord}
          categories={data.categories}
          isPending={
            createCategoryMutation.isPending ||
            updateCategoryMutation.isPending ||
            createProductMutation.isPending ||
            updateProductMutation.isPending ||
            createCollectionMutation.isPending ||
            updateCollectionMutation.isPending ||
            updateOrderStatusMutation.isPending
          }
          onSubmit={handleSubmit}
          onCancel={resetEditing}
        />
      )}

      {activeTabId === 'collections' &&
        editingRecord &&
        'type' in editingRecord && (
          <AdminCollectionItemsEditor
            collection={editingRecord as AdminCatalogCollection}
            categories={data.categories}
            products={data.products}
            isPending={updateCollectionItemsMutation.isPending}
            onSave={(items) =>
              updateCollectionItemsMutation.mutate({
                collection: editingRecord as AdminCatalogCollection,
                items,
              })
            }
            onQuickCreate={async (title) => {
              if ((editingRecord as AdminCatalogCollection).type === 'CATEGORY') {
                const category = await createCategoryMutation.mutateAsync({
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

              const product = await createProductMutation.mutateAsync({
                title,
                slug: '',
                description: '',
                categoryId: data.categories[0].id,
                price: 0,
                imageUrls: [],
                isActive: true,
              });

              return product.id;
            }}
          />
        )}

      {activeTabId === 'categories' && viewMode === 'tree' && (
        <AdminCategoryTreeView
          categories={filteredCategories}
          searchValue={searchValue}
          renderTitle={(category) =>
            renderHighlightedText(category.name, searchValue)
          }
          renderActions={renderActions}
        />
      )}

      {activeTabId === 'categories' && viewMode === 'table' && (
        <AdminRecordsTable
          records={filteredCategories}
          getRecordKey={(category) => category.id}
          emptyText="Категории не найдены."
          renderActions={renderActions}
          columns={[
            {
              key: 'name',
              title: 'Название',
              render: (category) =>
                renderHighlightedText(category.name, searchValue),
            },
            {
              key: 'slug',
              title: 'Slug',
              render: (category) =>
                renderHighlightedText(category.slug, searchValue),
            },
            {
              key: 'products',
              title: 'Продуктов',
              render: (category) => category.productsCount,
            },
            {
              key: 'status',
              title: 'Статус',
              render: (category) => getStatusLabel(category),
            },
          ]}
        />
      )}

      {activeTabId === 'categories' && viewMode === 'list' && (
        <AdminRecordsList
          records={filteredCategories}
          getRecordKey={(category) => category.id}
          getTitle={(category) =>
            renderHighlightedText(category.name, searchValue)
          }
          getDescription={(category) =>
            category.description
              ? renderHighlightedText(category.description, searchValue)
              : 'Без описания'
          }
          getMeta={(category) =>
            `slug: ${category.slug} · ${getStatusLabel(category)}`
          }
          renderActions={renderActions}
          emptyText="Категории не найдены."
        />
      )}

      {activeTabId === 'products' && viewMode === 'table' && (
        <AdminRecordsTable
          records={filteredProducts}
          getRecordKey={(product) => product.id}
          emptyText="Продукты не найдены."
          renderActions={renderActions}
          columns={[
            {
              key: 'title',
              title: 'Название',
              render: (product) =>
                renderHighlightedText(product.title, searchValue),
            },
            {
              key: 'category',
              title: 'Категория',
              render: (product) =>
                renderHighlightedText(product.category?.name ?? '', searchValue),
            },
            {
              key: 'price',
              title: 'Цена',
              render: (product) => formatPrice(product.price),
            },
            {
              key: 'status',
              title: 'Статус',
              render: (product) => getStatusLabel(product),
            },
          ]}
        />
      )}

      {activeTabId === 'products' && viewMode === 'list' && (
        <AdminRecordsList
          records={filteredProducts}
          getRecordKey={(product) => product.id}
          getTitle={(product) =>
            renderHighlightedText(product.title, searchValue)
          }
          getDescription={(product) =>
            renderHighlightedText(product.description || 'Без описания', searchValue)
          }
          getMeta={(product) =>
            `${product.category?.name ?? 'Без категории'} · ${formatPrice(product.price)} · ${getStatusLabel(product)}`
          }
          renderActions={renderActions}
          emptyText="Продукты не найдены."
        />
      )}

      {activeTabId === 'collections' && viewMode === 'table' && (
        <AdminRecordsTable
          records={filteredCollections}
          getRecordKey={(collection) => collection.id}
          emptyText="Подборки не найдены."
          renderActions={renderActions}
          columns={[
            {
              key: 'title',
              title: 'Название',
              render: (collection) =>
                renderHighlightedText(collection.title, searchValue),
            },
            {
              key: 'slug',
              title: 'Slug',
              render: (collection) =>
                renderHighlightedText(collection.slug, searchValue),
            },
            {
              key: 'type',
              title: 'Тип',
              render: (collection) =>
                collection.type === 'CATEGORY' ? 'Категории' : 'Продукты',
            },
            {
              key: 'items',
              title: 'Элементов',
              render: (collection) =>
                collection.type === 'CATEGORY'
                  ? collection.categories.length
                  : collection.products.length,
            },
            {
              key: 'status',
              title: 'Статус',
              render: (collection) => getStatusLabel(collection),
            },
          ]}
        />
      )}

      {activeTabId === 'collections' && viewMode === 'list' && (
        <AdminRecordsList
          records={filteredCollections}
          getRecordKey={(collection) => collection.id}
          getTitle={(collection) =>
            renderHighlightedText(collection.title, searchValue)
          }
          getDescription={(collection) =>
            renderHighlightedText(collection.description || 'Без описания', searchValue)
          }
          getMeta={(collection) =>
            `${collection.type === 'CATEGORY' ? 'Категории' : 'Продукты'} · ${collection.slug} · ${getStatusLabel(collection)}`
          }
          renderActions={renderActions}
          emptyText="Подборки не найдены."
        />
      )}

      {activeTabId === 'orders' && viewMode === 'table' && (
        <AdminRecordsTable
          records={filteredOrders}
          getRecordKey={(order) => order.id}
          emptyText="Заказы не найдены."
          renderActions={renderActions}
          columns={[
            {
              key: 'id',
              title: 'Заказ',
              render: (order) =>
                renderHighlightedText(order.id.slice(0, 8), searchValue),
            },
            {
              key: 'customer',
              title: 'Покупатель',
              render: (order) =>
                renderHighlightedText(order.customerName, searchValue),
            },
            {
              key: 'phone',
              title: 'Телефон',
              render: (order) =>
                renderHighlightedText(order.customerPhone, searchValue),
            },
            {
              key: 'total',
              title: 'Сумма',
              render: (order) => formatPrice(order.totalAmount),
            },
            {
              key: 'status',
              title: 'Статус',
              render: (order) => formatOrderStatus(order.status),
            },
          ]}
        />
      )}

      {activeTabId === 'orders' && viewMode === 'list' && (
        <AdminRecordsList
          records={filteredOrders}
          getRecordKey={(order) => order.id}
          getTitle={(order) =>
            renderHighlightedText(`Заказ № ${order.id.slice(0, 8)}`, searchValue)
          }
          getDescription={(order) =>
            renderHighlightedText(
              `${order.customerName}, ${order.customerPhone}, ${order.deliveryAddress}`,
              searchValue,
            )
          }
          getMeta={(order) =>
            `${formatPrice(order.totalAmount)} · ${formatOrderStatus(order.status)}`
          }
          renderActions={renderActions}
          emptyText="Заказы не найдены."
        />
      )}
    </section>
  );
}