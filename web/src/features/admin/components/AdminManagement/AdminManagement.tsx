import {
  useQuery,
  useQueryClient,
  useMutation,
} from '@tanstack/react-query';
import { useState } from 'react';

import {
  getAdminCatalogData,
  getAdminReferrals,
  uploadAdminImage,
  getAdminLogisticsConfiguration,
  getAdminUniversalQuotes,
  getAdminShipments,
  createAdminWarehouse,
  updateAdminWarehouse,
  deleteAdminWarehouse,
  updateAdminDeliveryProvider,
  updateAdminDeliveryService,
  getAdminUniversalQuote,
  getAdminShipment,
  type AdminWarehouse,
  type AdminDeliveryProvider,
  type AdminUniversalQuote,
  type AdminShipment,
} from '@/entities/admin';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { httpClient } from '@/shared/api/http-client';

import { AdminTabs } from '../AdminTabs';
import { AdminToolbar } from '../AdminToolbar';

import { adminManagementTabs } from '../../data/admin-management-tabs';
import { AdminCrudModal } from './components/AdminCrudModal';
import { AdminDeliveryQuoteModal } from './components/AdminDeliveryQuoteModal';
import { AdminManagementRecords } from './components/AdminManagementRecords';
import { AdminRecordActions } from './components/AdminRecordActions';
import { AdminLogisticsRecords } from './components/AdminLogisticsRecords';
import { AdminLogisticsModal } from './components/AdminLogisticsModal';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useAdminCrudHandlers } from './hooks/use-admin-crud-handlers';
import { useAdminManagementMutations } from './hooks/use-admin-management-mutations';
import { useAdminManagementState } from './hooks/use-admin-management-state';
import { useFilteredAdminRecords } from './hooks/use-filtered-admin-records';
import { getAdminManagementCounts } from './logic/get-admin-management-counts';
import { isAdminCatalogCollection } from './logic/is-admin-catalog-collection';
import type { AdminBulkAction } from '../AdminRecordsTable/types/admin-records-table';
import type { AdminCatalogData, AdminCrudRecord, AdminDeliveryQuote } from './types/admin-management-records';
import type { EditableRecord } from './types/admin-management-records';

type AdminManagementProps = {
  accessToken: string;
};

export function AdminManagement({ accessToken }: AdminManagementProps) {
  const queryClient = useQueryClient();

  const state = useAdminManagementState();
  const [logisticsRecord, setLogisticsRecord] = useState<AdminWarehouse | AdminDeliveryProvider | AdminUniversalQuote | AdminShipment>();
  const [isCreatingWarehouse, setIsCreatingWarehouse] = useState(false);
  const [warehouseToDelete, setWarehouseToDelete] = useState<AdminWarehouse>();

  const {
    data: catalogData,
    isPending: isCatalogPending,
    isError: isCatalogError,
  } = useQuery({
    queryKey: ['admin-catalog', accessToken],
    queryFn: () => getAdminCatalogData(accessToken) as Promise<Omit<AdminCatalogData, 'referrals'>>,
  });
  const { data: logisticsConfiguration, isPending: isLogisticsPending, isError: isLogisticsError } = useQuery({ queryKey: ['admin-logistics-configuration', accessToken], queryFn: () => getAdminLogisticsConfiguration(accessToken) });
  const { data: universalQuotes, isPending: areUniversalQuotesPending, isError: areUniversalQuotesError } = useQuery({ queryKey: ['admin-logistics-quotes', accessToken], queryFn: () => getAdminUniversalQuotes(accessToken) });
  const { data: shipments, isPending: areShipmentsPending, isError: areShipmentsError } = useQuery({ queryKey: ['admin-logistics-shipments', accessToken], queryFn: () => getAdminShipments(accessToken) });

  const { data: referralsData = [] } = useQuery({
    queryKey: ['admin-referrals', accessToken],
    queryFn: () => getAdminReferrals(accessToken),
  });

  const {
    data: deliveryQuotes = [],
    isPending: areDeliveryQuotesPending,
    isError: areDeliveryQuotesError,
  } = useQuery({
    queryKey: ['admin-delivery-quotes', accessToken],
    queryFn: () =>
      httpClient<AdminDeliveryQuote[]>('/admin/delivery-quotes', {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
  });

  const data: AdminCatalogData | undefined = catalogData
    ? { ...catalogData, referrals: referralsData, deliveryQuotes, warehouses: logisticsConfiguration?.warehouses ?? [], deliveryProviders: logisticsConfiguration?.providers ?? [], universalDeliveryQuotes: universalQuotes?.items ?? [], shipments: shipments?.items ?? [] }
    : undefined;

  const isPending = isCatalogPending || areDeliveryQuotesPending || isLogisticsPending || areUniversalQuotesPending || areShipmentsPending;
  const isError = isCatalogError || areDeliveryQuotesError || isLogisticsError || areUniversalQuotesError || areShipmentsError;

  function refreshAdminData() {
    queryClient.invalidateQueries({
      queryKey: ['admin-catalog', accessToken],
    });
    queryClient.invalidateQueries({
      queryKey: ['admin-overview', accessToken],
    });
    queryClient.invalidateQueries({
      queryKey: ['admin-referrals', accessToken],
    });
  }

  const mutations = useAdminManagementMutations({
    accessToken,
    onSuccess: refreshAdminData,
  });
  const refreshLogisticsConfiguration = () => queryClient.invalidateQueries({ queryKey: ['admin-logistics-configuration', accessToken] });
  const warehouseMutation = useMutation({ mutationFn: (payload: Partial<AdminWarehouse>) => logisticsRecord && 'isConfigured' in logisticsRecord ? updateAdminWarehouse(accessToken, logisticsRecord.id, payload) : createAdminWarehouse(accessToken, payload), onSuccess: async () => { await refreshLogisticsConfiguration(); setLogisticsRecord(undefined); setIsCreatingWarehouse(false); queryClient.invalidateQueries({ queryKey: ['admin-catalog', accessToken] }); } });
  const deleteWarehouseMutation = useMutation({ mutationFn: (id: string) => deleteAdminWarehouse(accessToken, id), onSuccess: async () => { await refreshLogisticsConfiguration(); setWarehouseToDelete(undefined); } });
  const providerMutation = useMutation({ mutationFn: (provider: AdminDeliveryProvider) => updateAdminDeliveryProvider(accessToken, provider), onSuccess: refreshLogisticsConfiguration });
  const serviceMutation = useMutation({ mutationFn: (params: { provider: AdminDeliveryProvider; serviceId: string; isActive: boolean }) => { const service = params.provider.services.find((item) => item.id === params.serviceId); if (!service) throw new Error('Service not found'); return updateAdminDeliveryService(accessToken, { ...service, isActive: params.isActive }); }, onSuccess: refreshLogisticsConfiguration });
  const logisticsDetailQuery = useQuery({ queryKey: ['admin-logistics-detail', logisticsRecord?.id], enabled: Boolean(logisticsRecord && ('ownerType' in logisticsRecord || 'orderId' in logisticsRecord)), queryFn: () => { if (!logisticsRecord) throw new Error('Record not selected'); return 'orderId' in logisticsRecord ? getAdminShipment(accessToken, logisticsRecord.id) : getAdminUniversalQuote(accessToken, logisticsRecord.id); } });

  const filteredRecords = useFilteredAdminRecords(data, state.searchValue);
  const counts = getAdminManagementCounts(data);
  const activeTab = adminManagementTabs.find(
    (tab) => tab.id === state.activeTabId,
  );

  const collectionEditingRecord =
    state.activeTabId === 'collections' &&
    isAdminCatalogCollection(state.editingRecord)
      ? state.editingRecord
      : undefined;

  const selectedDeliveryQuote =
    state.editingRecord && 'destinationRegion' in state.editingRecord
      ? state.editingRecord
      : undefined;
  const deliveryQuoteEditingRecord = selectedDeliveryQuote
    ? deliveryQuotes.find((quote) => quote.id === selectedDeliveryQuote.id) ??
      selectedDeliveryQuote
    : undefined;
  const crudEditingRecord = deliveryQuoteEditingRecord
    ? undefined
    : state.editingRecord as AdminCrudRecord | undefined;

  const handlers = useAdminCrudHandlers({
    activeTabId: state.activeTabId,
    editingRecord: state.editingRecord,
    data: data ?? {
      marketCategories: [],
      products: [],
      collections: [],
      orders: [],
      adCategories: [],
      ads: [],
      users: [],
      referrals: [],
      deliveryQuotes: [],
      warehouses: [],
      deliveryProviders: [],
      universalDeliveryQuotes: [],
      shipments: [],
    },
    mutations,
    resetEditing: state.resetEditing,
  });

  const bulkActions: AdminBulkAction[] = (() => {
    if (state.activeTabId === 'market-categories') {
      return [
        { label: 'Пометить удалёнными', variant: 'warning' as const, icon: 'archive' as const, onClick: (ids) => mutations.bulkDeleteMarketCategoriesMutation.mutate(ids) },
        { label: 'Восстановить', icon: 'restore' as const, onClick: (ids) => mutations.bulkRestoreMarketCategoriesMutation.mutate(ids) },
        { label: 'Удалить навсегда', variant: 'destructive' as const, icon: 'trash' as const, onClick: (ids) => mutations.bulkHardDeleteMarketCategoriesMutation.mutate(ids) },
      ];
    }
    if (state.activeTabId === 'market-products') {
      return [
        { label: 'Пометить удалёнными', variant: 'warning' as const, icon: 'archive' as const, onClick: (ids) => mutations.bulkDeleteProductsMutation.mutate(ids) },
        { label: 'Восстановить', icon: 'restore' as const, onClick: (ids) => mutations.bulkRestoreProductsMutation.mutate(ids) },
        { label: 'Удалить навсегда', variant: 'destructive' as const, icon: 'trash' as const, onClick: (ids) => mutations.bulkHardDeleteProductsMutation.mutate(ids) },
      ];
    }
    if (state.activeTabId === 'collections') {
      return [
        { label: 'Пометить удалёнными', variant: 'warning' as const, icon: 'archive' as const, onClick: (ids) => {
          // For now, use individual delete operations for each selected collection
          ids.forEach(id => mutations.deleteCollectionMutation.mutate(id));
        }},
        { label: 'Восстановить', icon: 'restore' as const, onClick: (ids) => {
          // For now, use individual restore operations for each selected collection
          ids.forEach(id => mutations.restoreCollectionMutation.mutate(id));
        }},
        { label: 'Удалить навсегда', variant: 'destructive' as const, icon: 'trash' as const, onClick: (ids) => {
          // For now, use individual hard delete operations for each selected collection
          ids.forEach(id => mutations.hardDeleteCollectionMutation.mutate(id));
        }},
      ];
    }
    if (state.activeTabId === 'ad-categories') {
      return [
        { label: 'Пометить удалёнными', variant: 'warning' as const, icon: 'archive' as const, onClick: (ids) => mutations.bulkDeleteAdCategoriesMutation.mutate(ids) },
        { label: 'Восстановить', icon: 'restore' as const, onClick: (ids) => mutations.bulkRestoreAdCategoriesMutation.mutate(ids) },
        { label: 'Удалить навсегда', variant: 'destructive' as const, icon: 'trash' as const, onClick: (ids) => mutations.bulkHardDeleteAdCategoriesMutation.mutate(ids) },
      ];
    }
    if (state.activeTabId === 'ads') {
      return [
        { label: 'Пометить удалёнными', variant: 'warning' as const, icon: 'archive' as const, onClick: (ids) => mutations.bulkDeleteAdsMutation.mutate(ids) },
        { label: 'Восстановить', icon: 'restore' as const, onClick: (ids) => mutations.bulkRestoreAdsMutation.mutate(ids) },
        { label: 'Удалить навсегда', variant: 'destructive' as const, icon: 'trash' as const, onClick: (ids) => mutations.bulkHardDeleteAdsMutation.mutate(ids) },
      ];
    }
    if (state.activeTabId === 'users') {
      return [
        { label: 'Пометить удалёнными', variant: 'warning' as const, icon: 'archive' as const, onClick: (ids) => mutations.bulkDeleteUsersMutation.mutate(ids) },
        { label: 'Удалить навсегда', variant: 'destructive' as const, icon: 'trash' as const, onClick: (ids) => mutations.bulkHardDeleteUsersMutation.mutate(ids) },
      ];
    }
    return [];
  })();

  function renderActions(record: EditableRecord) {
    return (
      <AdminRecordActions
        activeTabId={state.activeTabId}
        record={record}
        onEdit={state.handleEdit}
        onRestore={handlers.handleRestore}
        onDelete={handlers.handleDelete}
        onHardDelete={handlers.handleHardDelete}
      />
    );
  }

  if (isPending) {
    return (
      <SkeletonLoader
        layout="stack"
        count={5}
        itemClassName="min-h-14"
        ariaLabel="Загружаем данные админ-панели"
      />
    );
  }

  if (isError || !data) {
    return (
        <ErrorMessage>
          Не удалось загрузить данные управления.
        </ErrorMessage>
    );
  }

  return (
    <section className="space-y-5">
      <AdminTabs
        tabs={adminManagementTabs}
        activeTabId={state.activeTabId}
        counts={counts}
        onTabChange={state.handleTabChange}
      />

      <AdminToolbar
        searchValue={state.searchValue}
        viewMode={state.viewMode}
        canUseTree={['market-categories', 'ad-categories'].includes(
          state.activeTabId,
        )}
        canCreate={activeTab?.capabilities?.create ?? !['orders', 'delivery-quotes', 'ads', 'users', 'referrals'].includes(state.activeTabId)}
        createLabel={activeTab?.createLabel}
        onSearchChange={state.setSearchValue}
        onViewModeChange={state.setViewMode}
        onCreateClick={() => { if (state.activeTabId === 'warehouses') setIsCreatingWarehouse(true); else state.handleCreateClick(); }}
      />

      <AdminCrudModal
        isOpen={state.isCrudFormOpen}
        activeTabId={state.activeTabId}
        editingRecord={crudEditingRecord}
        collectionEditingRecord={collectionEditingRecord}
        data={data}
        isCrudFormPending={mutations.isCrudFormPending}
        isCollectionItemsPending={mutations.updateCollectionItemsMutation.isPending}
        onUploadImage={(file) =>
          uploadAdminImage(accessToken, file).then((response) => response.url)
        }
        onSubmit={handlers.handleSubmit}
        onClose={state.resetEditing}
        onCollectionItemsSave={handlers.handleCollectionItemsSave}
        onQuickCreate={handlers.handleQuickCreate}
      />

      {deliveryQuoteEditingRecord && (
        <AdminDeliveryQuoteModal
          key={deliveryQuoteEditingRecord.id}
          accessToken={accessToken}
          isOpen
          quote={deliveryQuoteEditingRecord}
          onClose={state.resetEditing}
        />
      )}

      {['warehouses', 'delivery-providers', 'universal-delivery-quotes', 'shipments'].includes(state.activeTabId) ? <AdminLogisticsRecords tabId={state.activeTabId} viewMode={state.viewMode} warehouses={filteredRecords.warehouses} providers={filteredRecords.deliveryProviders} quotes={filteredRecords.universalDeliveryQuotes} shipments={filteredRecords.shipments} onOpen={setLogisticsRecord} onDeleteWarehouse={setWarehouseToDelete} /> : <AdminManagementRecords
        activeTabId={state.activeTabId}
        viewMode={state.viewMode}
        searchValue={state.searchValue}
        records={filteredRecords}
        renderActions={renderActions}
        bulkActions={bulkActions}
      />}
      <AdminLogisticsModal key={logisticsRecord?.id ?? (isCreatingWarehouse ? 'new-warehouse' : 'closed')} record={logisticsRecord} details={logisticsDetailQuery.data} isCreatingWarehouse={isCreatingWarehouse} providers={data.deliveryProviders} isPending={warehouseMutation.isPending || providerMutation.isPending || serviceMutation.isPending} onClose={() => { setLogisticsRecord(undefined); setIsCreatingWarehouse(false); }} onSaveWarehouse={(payload) => warehouseMutation.mutate(payload)} onSaveProvider={(provider) => providerMutation.mutate(provider)} onSaveService={(provider, serviceId, isActive) => serviceMutation.mutate({ provider, serviceId, isActive })} />
      <Modal isOpen={Boolean(warehouseToDelete)} title="Удалить склад?" size="sm" preventClose={deleteWarehouseMutation.isPending} onClose={() => setWarehouseToDelete(undefined)}><div className="space-y-5 p-6"><p className="text-sm text-muted-foreground">Неиспользуемый склад будет удалён. При наличии зависимостей склад будет только деактивирован.</p><div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setWarehouseToDelete(undefined)}>Отмена</Button><Button variant="destructive" disabled={deleteWarehouseMutation.isPending} onClick={() => warehouseToDelete && deleteWarehouseMutation.mutate(warehouseToDelete.id)}>Продолжить</Button></div></div></Modal>
    </section>
  );
}
