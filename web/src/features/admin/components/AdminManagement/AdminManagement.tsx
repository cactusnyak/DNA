import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState } from "react";

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
  type AdminLogisticsRecord,
} from "@/entities/admin";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { httpClient } from "@/shared/api/http-client";

import { AdminTabs } from "../AdminTabs";
import { AdminToolbar } from "../AdminToolbar";

import { adminManagementTabs } from "../../data/admin-management-tabs";
import { AdminCrudModal } from "./components/AdminCrudModal";
import { AdminDeliveryQuoteModal } from "./components/AdminDeliveryQuoteModal";
import { AdminManagementRecords } from "./components/AdminManagementRecords";
import { AdminRecordActions } from "./components/AdminRecordActions";
import { AdminLogisticsRecords } from "./components/AdminLogisticsRecords";
import { AdminLogisticsModal } from "./components/AdminLogisticsModal";
import { useAdminCrudHandlers } from "./hooks/use-admin-crud-handlers";
import { useAdminManagementMutations } from "./hooks/use-admin-management-mutations";
import { useAdminManagementState } from "./hooks/use-admin-management-state";
import { useFilteredAdminRecords } from "./hooks/use-filtered-admin-records";
import { getAdminManagementCounts } from "./logic/get-admin-management-counts";
import { isAdminCatalogCollection } from "./logic/is-admin-catalog-collection";
import type { AdminBulkAction } from "../AdminRecordsTable/types/admin-records-table";
import type {
  AdminCatalogData,
  AdminCrudRecord,
  AdminDeliveryQuote,
} from "./types/admin-management-records";
import type { EditableRecord } from "./types/admin-management-records";

type AdminManagementProps = {
  accessToken: string;
};

export function AdminManagement({ accessToken }: AdminManagementProps) {
  const queryClient = useQueryClient();

  const state = useAdminManagementState();
  const [logisticsRecord, setLogisticsRecord] =
    useState<AdminLogisticsRecord>();
  const [isCreatingWarehouse, setIsCreatingWarehouse] = useState(false);

  const {
    data: catalogData,
    isPending: isCatalogPending,
    isError: isCatalogError,
  } = useQuery({
    queryKey: ["admin-catalog", accessToken],
    queryFn: () =>
      getAdminCatalogData(accessToken) as Promise<
        Omit<AdminCatalogData, "referrals">
      >,
  });
  const {
    data: logisticsConfiguration,
    isPending: isLogisticsPending,
    isError: isLogisticsError,
    refetch: refetchLogisticsConfiguration,
  } = useQuery({
    queryKey: ["admin-logistics-configuration", accessToken],
    queryFn: () => getAdminLogisticsConfiguration(accessToken),
  });
  const {
    data: universalQuotes,
    isPending: areUniversalQuotesPending,
    isError: areUniversalQuotesError,
  } = useQuery({
    queryKey: ["admin-logistics-quotes", accessToken],
    queryFn: () => getAdminUniversalQuotes(accessToken),
  });
  const {
    data: shipments,
    isPending: areShipmentsPending,
    isError: areShipmentsError,
  } = useQuery({
    queryKey: ["admin-logistics-shipments", accessToken],
    queryFn: () => getAdminShipments(accessToken),
  });

  const { data: referralsData = [] } = useQuery({
    queryKey: ["admin-referrals", accessToken],
    queryFn: () => getAdminReferrals(accessToken),
  });

  const {
    data: deliveryQuotes = [],
    isPending: areDeliveryQuotesPending,
    isError: areDeliveryQuotesError,
  } = useQuery({
    queryKey: ["admin-delivery-quotes", accessToken],
    queryFn: () =>
      httpClient<AdminDeliveryQuote[]>("/admin/delivery-quotes", {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
  });

  const data: AdminCatalogData | undefined = catalogData
    ? {
        ...catalogData,
        referrals: referralsData,
        deliveryQuotes,
        warehouses: logisticsConfiguration?.warehouses ?? [],
        deliveryProviders: logisticsConfiguration?.providers ?? [],
        universalDeliveryQuotes: universalQuotes?.items ?? [],
        shipments: shipments?.items ?? [],
      }
    : undefined;

  const isPending =
    isCatalogPending ||
    areDeliveryQuotesPending ||
    areUniversalQuotesPending ||
    areShipmentsPending;
  const isError =
    isCatalogError ||
    areDeliveryQuotesError ||
    areUniversalQuotesError ||
    areShipmentsError;

  function refreshAdminData() {
    queryClient.invalidateQueries({
      queryKey: ["admin-catalog", accessToken],
    });
    queryClient.invalidateQueries({
      queryKey: ["admin-overview", accessToken],
    });
    queryClient.invalidateQueries({
      queryKey: ["admin-referrals", accessToken],
    });
  }

  const mutations = useAdminManagementMutations({
    accessToken,
    onSuccess: refreshAdminData,
  });
  const refreshLogisticsConfiguration = () =>
    queryClient.invalidateQueries({
      queryKey: ["admin-logistics-configuration", accessToken],
    });
  const closeLogisticsModal = () => {
    setLogisticsRecord(undefined);
    setIsCreatingWarehouse(false);
  };
  const warehouseMutation = useMutation({
    mutationFn: (payload: Partial<AdminWarehouse>) =>
      logisticsRecord?.type === "warehouse"
        ? updateAdminWarehouse(
            accessToken,
            logisticsRecord.warehouse.id,
            payload,
          )
        : createAdminWarehouse(accessToken, payload),
    onSuccess: async () => {
      await Promise.all([
        refreshLogisticsConfiguration(),
        queryClient.invalidateQueries({
          queryKey: ["admin-catalog", accessToken],
        }),
      ]);
      closeLogisticsModal();
    },
  });
  const deleteWarehouseMutation = useMutation({
    mutationFn: (id: string) => deleteAdminWarehouse(accessToken, id),
    onSuccess: refreshLogisticsConfiguration,
  });
  const providerMutation = useMutation({
    mutationFn: (provider: AdminDeliveryProvider) =>
      updateAdminDeliveryProvider(accessToken, provider),
    onSuccess: async () => {
      await refreshLogisticsConfiguration();
      closeLogisticsModal();
    },
  });
  const serviceMutation = useMutation({
    mutationFn: (service: AdminDeliveryProvider["services"][number]) =>
      updateAdminDeliveryService(accessToken, service),
    onSuccess: async () => {
      await refreshLogisticsConfiguration();
      closeLogisticsModal();
    },
  });
  const logisticsDetailQuery = useQuery({
    queryKey: [
      "admin-logistics-detail",
      logisticsRecord?.type,
      logisticsRecord?.type === "quote"
        ? logisticsRecord.quote.id
        : logisticsRecord?.type === "shipment"
          ? logisticsRecord.shipment.id
          : undefined,
    ],
    enabled:
      logisticsRecord?.type === "quote" || logisticsRecord?.type === "shipment",
    queryFn: () => {
      if (logisticsRecord?.type === "shipment")
        return getAdminShipment(accessToken, logisticsRecord.shipment.id);
      if (logisticsRecord?.type === "quote")
        return getAdminUniversalQuote(accessToken, logisticsRecord.quote.id);
      throw new Error("Record is not a quote or shipment");
    },
  });
  const logisticsMutationError =
    warehouseMutation.error ?? providerMutation.error ?? serviceMutation.error;
  const openLogisticsRecord = (record: AdminLogisticsRecord) => {
    warehouseMutation.reset();
    providerMutation.reset();
    serviceMutation.reset();
    setLogisticsRecord(record);
  };

  const filteredRecords = useFilteredAdminRecords(data, state.searchValue);
  const counts = getAdminManagementCounts(data);
  const activeTab = adminManagementTabs.find(
    (tab) => tab.id === state.activeTabId,
  );

  const collectionEditingRecord =
    state.activeTabId === "collections" &&
    isAdminCatalogCollection(state.editingRecord)
      ? state.editingRecord
      : undefined;

  const selectedDeliveryQuote =
    state.editingRecord && "destinationRegion" in state.editingRecord
      ? state.editingRecord
      : undefined;
  const deliveryQuoteEditingRecord = selectedDeliveryQuote
    ? (deliveryQuotes.find((quote) => quote.id === selectedDeliveryQuote.id) ??
      selectedDeliveryQuote)
    : undefined;
  const crudEditingRecord = deliveryQuoteEditingRecord
    ? undefined
    : (state.editingRecord as AdminCrudRecord | undefined);

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
    if (state.activeTabId === "market-categories") {
      return [
        {
          label: "Пометить удалёнными",
          variant: "warning" as const,
          icon: "archive" as const,
          onClick: (ids) =>
            mutations.bulkDeleteMarketCategoriesMutation.mutate(ids),
        },
        {
          label: "Восстановить",
          icon: "restore" as const,
          onClick: (ids) =>
            mutations.bulkRestoreMarketCategoriesMutation.mutate(ids),
        },
        {
          label: "Удалить навсегда",
          variant: "destructive" as const,
          icon: "trash" as const,
          onClick: (ids) =>
            mutations.bulkHardDeleteMarketCategoriesMutation.mutate(ids),
        },
      ];
    }
    if (state.activeTabId === "market-products") {
      return [
        {
          label: "Пометить удалёнными",
          variant: "warning" as const,
          icon: "archive" as const,
          onClick: (ids) => mutations.bulkDeleteProductsMutation.mutate(ids),
        },
        {
          label: "Восстановить",
          icon: "restore" as const,
          onClick: (ids) => mutations.bulkRestoreProductsMutation.mutate(ids),
        },
        {
          label: "Удалить навсегда",
          variant: "destructive" as const,
          icon: "trash" as const,
          onClick: (ids) =>
            mutations.bulkHardDeleteProductsMutation.mutate(ids),
        },
      ];
    }
    if (state.activeTabId === "collections") {
      return [
        {
          label: "Пометить удалёнными",
          variant: "warning" as const,
          icon: "archive" as const,
          onClick: (ids) => {
            // For now, use individual delete operations for each selected collection
            ids.forEach((id) => mutations.deleteCollectionMutation.mutate(id));
          },
        },
        {
          label: "Восстановить",
          icon: "restore" as const,
          onClick: (ids) => {
            // For now, use individual restore operations for each selected collection
            ids.forEach((id) => mutations.restoreCollectionMutation.mutate(id));
          },
        },
        {
          label: "Удалить навсегда",
          variant: "destructive" as const,
          icon: "trash" as const,
          onClick: (ids) => {
            // For now, use individual hard delete operations for each selected collection
            ids.forEach((id) =>
              mutations.hardDeleteCollectionMutation.mutate(id),
            );
          },
        },
      ];
    }
    if (state.activeTabId === "ad-categories") {
      return [
        {
          label: "Пометить удалёнными",
          variant: "warning" as const,
          icon: "archive" as const,
          onClick: (ids) =>
            mutations.bulkDeleteAdCategoriesMutation.mutate(ids),
        },
        {
          label: "Восстановить",
          icon: "restore" as const,
          onClick: (ids) =>
            mutations.bulkRestoreAdCategoriesMutation.mutate(ids),
        },
        {
          label: "Удалить навсегда",
          variant: "destructive" as const,
          icon: "trash" as const,
          onClick: (ids) =>
            mutations.bulkHardDeleteAdCategoriesMutation.mutate(ids),
        },
      ];
    }
    if (state.activeTabId === "ads") {
      return [
        {
          label: "Пометить удалёнными",
          variant: "warning" as const,
          icon: "archive" as const,
          onClick: (ids) => mutations.bulkDeleteAdsMutation.mutate(ids),
        },
        {
          label: "Восстановить",
          icon: "restore" as const,
          onClick: (ids) => mutations.bulkRestoreAdsMutation.mutate(ids),
        },
        {
          label: "Удалить навсегда",
          variant: "destructive" as const,
          icon: "trash" as const,
          onClick: (ids) => mutations.bulkHardDeleteAdsMutation.mutate(ids),
        },
      ];
    }
    if (state.activeTabId === "users") {
      return [
        {
          label: "Пометить удалёнными",
          variant: "warning" as const,
          icon: "archive" as const,
          onClick: (ids) => mutations.bulkDeleteUsersMutation.mutate(ids),
        },
        {
          label: "Удалить навсегда",
          variant: "destructive" as const,
          icon: "trash" as const,
          onClick: (ids) => mutations.bulkHardDeleteUsersMutation.mutate(ids),
        },
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

  function handleDeleteWarehouse(warehouse: AdminWarehouse) {
    if (
      !window.confirm(
        `Удалить склад «${warehouse.name}»? При наличии зависимостей склад будет деактивирован.`,
      )
    ) {
      return;
    }

    deleteWarehouseMutation.mutate(warehouse.id);
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
    return <ErrorMessage>Не удалось загрузить данные управления.</ErrorMessage>;
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
        canUseTree={["market-categories", "ad-categories"].includes(
          state.activeTabId,
        )}
        canCreate={
          activeTab?.capabilities?.create ??
          !["orders", "delivery-quotes", "ads", "users", "referrals"].includes(
            state.activeTabId,
          )
        }
        createLabel={activeTab?.createLabel}
        onSearchChange={state.setSearchValue}
        onViewModeChange={state.setViewMode}
        onCreateClick={() => {
          if (state.activeTabId === "warehouses") setIsCreatingWarehouse(true);
          else state.handleCreateClick();
        }}
      />

      <AdminCrudModal
        isOpen={state.isCrudFormOpen}
        activeTabId={state.activeTabId}
        editingRecord={crudEditingRecord}
        collectionEditingRecord={collectionEditingRecord}
        data={data}
        isCrudFormPending={mutations.isCrudFormPending}
        isCollectionItemsPending={
          mutations.updateCollectionItemsMutation.isPending
        }
        onUploadImage={(file) =>
          uploadAdminImage(accessToken, file).then((response) => response.url)
        }
        onSubmit={handlers.handleSubmit}
        onClose={state.resetEditing}
        onCollectionItemsSave={handlers.handleCollectionItemsSave}
        onQuickCreate={handlers.handleQuickCreate}
        logisticsOptionsState={
          isLogisticsPending ? "loading" : isLogisticsError ? "error" : "ready"
        }
        onRetryLogisticsOptions={() => {
          void refetchLogisticsConfiguration();
        }}
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

      {[
        "warehouses",
        "delivery-providers",
        "universal-delivery-quotes",
        "shipments",
      ].includes(state.activeTabId) ? (
        <AdminLogisticsRecords
          tabId={state.activeTabId}
          viewMode={state.viewMode}
          warehouses={filteredRecords.warehouses}
          providers={filteredRecords.deliveryProviders}
          quotes={filteredRecords.universalDeliveryQuotes}
          shipments={filteredRecords.shipments}
          onOpen={openLogisticsRecord}
          onDeleteWarehouse={handleDeleteWarehouse}
        />
      ) : (
        <AdminManagementRecords
          activeTabId={state.activeTabId}
          viewMode={state.viewMode}
          searchValue={state.searchValue}
          records={filteredRecords}
          renderActions={renderActions}
          bulkActions={bulkActions}
        />
      )}
      <AdminLogisticsModal
        key={
          logisticsRecord
            ? `${logisticsRecord.type}:${logisticsRecord.type === "warehouse" ? logisticsRecord.warehouse.id : logisticsRecord.type === "provider" ? logisticsRecord.provider.id : logisticsRecord.type === "service" ? logisticsRecord.service.id : logisticsRecord.type === "quote" ? logisticsRecord.quote.id : logisticsRecord.shipment.id}`
            : isCreatingWarehouse
              ? "new-warehouse"
              : "closed"
        }
        record={logisticsRecord}
        details={logisticsDetailQuery.data}
        isCreatingWarehouse={isCreatingWarehouse}
        providers={data.deliveryProviders}
        isPending={
          warehouseMutation.isPending ||
          providerMutation.isPending ||
          serviceMutation.isPending
        }
        mutationError={
          logisticsMutationError instanceof Error
            ? logisticsMutationError.message
            : undefined
        }
        onClose={closeLogisticsModal}
        onSaveWarehouse={(payload) => warehouseMutation.mutate(payload)}
        onSaveProvider={(provider) => providerMutation.mutate(provider)}
        onSaveService={(service) => serviceMutation.mutate(service)}
      />
    </section>
  );
}
