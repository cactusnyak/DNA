import {
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  getAdminCatalogData,
  getAdminReferrals,
  uploadAdminImage,
} from '@/entities/admin';

import { AdminTabs } from '../AdminTabs';
import { AdminToolbar } from '../AdminToolbar';

import { adminManagementTabs } from '../../data/admin-management-tabs';
import { AdminCrudModal } from './components/AdminCrudModal';
import { AdminManagementRecords } from './components/AdminManagementRecords';
import { AdminRecordActions } from './components/AdminRecordActions';
import { useAdminCrudHandlers } from './hooks/use-admin-crud-handlers';
import { useAdminManagementMutations } from './hooks/use-admin-management-mutations';
import { useAdminManagementState } from './hooks/use-admin-management-state';
import { useFilteredAdminRecords } from './hooks/use-filtered-admin-records';
import { getAdminManagementCounts } from './logic/get-admin-management-counts';
import { isAdminCatalogCollection } from './logic/is-admin-catalog-collection';
import type { AdminBulkAction } from '../AdminRecordsTable/types/admin-records-table';
import type { AdminCatalogData } from './types/admin-management-records';
import type { EditableRecord } from './types/admin-management-records';

type AdminManagementProps = {
  accessToken: string;
};

export function AdminManagement({ accessToken }: AdminManagementProps) {
  const queryClient = useQueryClient();

  const state = useAdminManagementState();

  const {
    data: catalogData,
    isPending: isCatalogPending,
    isError: isCatalogError,
  } = useQuery({
    queryKey: ['admin-catalog', accessToken],
    queryFn: () => getAdminCatalogData(accessToken) as Promise<Omit<AdminCatalogData, 'referrals'>>,
  });

  const { data: referralsData = [] } = useQuery({
    queryKey: ['admin-referrals', accessToken],
    queryFn: () => getAdminReferrals(accessToken),
  });

  const data: AdminCatalogData | undefined = catalogData
    ? { ...catalogData, referrals: referralsData }
    : undefined;

  const isPending = isCatalogPending;
  const isError = isCatalogError;

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
        canCreate={
          !['orders', 'ads', 'users', 'referrals'].includes(state.activeTabId)
        }
        createLabel={activeTab?.createLabel}
        onSearchChange={state.setSearchValue}
        onViewModeChange={state.setViewMode}
        onCreateClick={state.handleCreateClick}
      />

      <AdminCrudModal
        isOpen={state.isCrudFormOpen}
        activeTabId={state.activeTabId}
        editingRecord={state.editingRecord}
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

      <AdminManagementRecords
        activeTabId={state.activeTabId}
        viewMode={state.viewMode}
        searchValue={state.searchValue}
        records={filteredRecords}
        renderActions={renderActions}
        bulkActions={bulkActions}
      />
    </section>
  );
}


