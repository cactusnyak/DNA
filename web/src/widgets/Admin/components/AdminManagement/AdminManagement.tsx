import {
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { getAdminCatalogData } from '@/entities/admin';

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
import type { AdminCatalogData } from './types/admin-management-records';
import type { EditableRecord } from './types/admin-management-records';

type AdminManagementProps = {
  accessToken: string;
};

export function AdminManagement({ accessToken }: AdminManagementProps) {
  const queryClient = useQueryClient();

  const state = useAdminManagementState();

  const {
    data,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['admin-catalog', accessToken],
    queryFn: () => getAdminCatalogData(accessToken) as Promise<AdminCatalogData>,
  });

  function refreshAdminData() {
    queryClient.invalidateQueries({
      queryKey: ['admin-catalog', accessToken],
    });
    queryClient.invalidateQueries({
      queryKey: ['admin-overview', accessToken],
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
      categories: [],
      products: [],
      collections: [],
      orders: [],
    },
    mutations,
    resetEditing: state.resetEditing,
  });

  function renderActions(record: EditableRecord) {
    return (
      <AdminRecordActions
        activeTabId={state.activeTabId}
        record={record}
        onEdit={state.handleEdit}
        onRestore={handlers.handleRestore}
        onDelete={handlers.handleDelete}
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
        canUseTree={state.activeTabId === 'categories'}
        canCreate={state.activeTabId !== 'orders'}
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
      />
    </section>
  );
}
