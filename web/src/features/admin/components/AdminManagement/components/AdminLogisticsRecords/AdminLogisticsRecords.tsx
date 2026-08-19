import { Eye, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type {
  AdminDeliveryProvider,
  AdminLogisticsRecord,
  AdminShipment,
  AdminUniversalQuote,
  AdminWarehouse,
} from "@/entities/admin";
import { formatPrice } from "@/shared/utils/format-price";
import { AdminShortId } from "@/features/admin/components/AdminShortId";
import {
  getWarehouseTypeLabel,
  WAREHOUSE_TYPE_OPTIONS,
} from "@/features/admin/logic/warehouse-type-labels";
import {
  buildDeliveryProviderTree,
  type DeliveryProviderTreeRecord,
} from "@/features/admin/logic/delivery-provider-tree";
import { AdminRecordsTable } from "../../../AdminRecordsTable";
import type {
  AdminManagementTabId,
  AdminViewMode,
} from "../../../../types/admin-management";

function getQuoteStatusVariant(status: string) {
  if (status === "SELECTED") return "access" as const;
  if (status === "CANCELLED") return "destructive" as const;
  if (status === "EXPIRED") return "muted" as const;
  return "default" as const;
}

function getShipmentStatusVariant(status: string) {
  if (status === "DELIVERED") return "access" as const;
  if (
    status === "BOOKING_FAILED" ||
    status === "DELIVERY_FAILED" ||
    status === "CANCELLED"
  )
    return "destructive" as const;
  if (status === "MANUAL_REVIEW" || status === "RETURNING")
    return "warning" as const;
  if (status === "DRAFT" || status === "RETURNED") return "muted" as const;
  return "default" as const;
}

type Props = {
  tabId: AdminManagementTabId;
  viewMode: AdminViewMode;
  warehouses: AdminWarehouse[];
  providers: AdminDeliveryProvider[];
  quotes: AdminUniversalQuote[];
  shipments: AdminShipment[];
  onOpen: (record: AdminLogisticsRecord) => void;
  onDeleteWarehouse: (warehouse: AdminWarehouse) => void;
  searchValue: string;
};

function Actions({
  onOpen,
  canEdit,
  canDelete,
  onDelete,
}: {
  onOpen: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
  onDelete?: () => void;
}) {
  const label = canEdit ? "Изменить запись" : "Открыть запись";
  const OpenIcon = canEdit ? Pencil : Eye;
  return (
    <div className="flex justify-end gap-2">
      <Button
        type="button"
        size="icon-sm"
        variant="secondary"
        aria-label={label}
        title={label}
        onClick={onOpen}
      >
        <OpenIcon className="size-3.5" strokeWidth={1.5} />
      </Button>
      {canDelete && (
        <Button
          type="button"
          size="icon-sm"
          variant="destructive"
          aria-label="Удалить склад"
          title="Удалить склад"
          onClick={onDelete}
        >
          <Trash2 className="size-3.5" strokeWidth={1.5} />
        </Button>
      )}
    </div>
  );
}

export function AdminLogisticsRecords(props: Props) {
  if (props.tabId === "warehouses") {
    if (props.viewMode === "list")
      return (
        <div className="grid gap-3 md:grid-cols-2">
          {props.warehouses.map((warehouse) => (
            <article
              key={warehouse.id}
              className="rounded-2xl border border-border/80 p-4"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{warehouse.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {warehouse.code} · ID: {warehouse.id.slice(0, 8)}
                  </div>
                </div>
                <StatusBadge
                  text={warehouse.isActive ? "Активен" : "Отключён"}
                  variant={warehouse.isActive ? "access" : "destructive"}
                />
              </div>
              <Actions
                canEdit
                canDelete
                onOpen={() => props.onOpen({ type: "warehouse", warehouse })}
                onDelete={() => props.onDeleteWarehouse(warehouse)}
              />
            </article>
          ))}
        </div>
      );
    return (
      <AdminRecordsTable
        tableKey="warehouses"
        records={props.warehouses}
        getRecordKey={(record) => record.id}
        emptyText="Склады не найдены."
        renderActions={(warehouse) => (
          <Actions
            canEdit
            canDelete
            onOpen={() => props.onOpen({ type: "warehouse", warehouse })}
            onDelete={() => props.onDeleteWarehouse(warehouse)}
          />
        )}
        columns={[
          {
            key: "id",
            title: "ID",
            width: 100,
            getValue: (record) => record.id,
            render: (record) => <AdminShortId value={record.id} />,
          },
          {
            key: "code",
            title: "Код",
            sortable: true,
            filter: { type: "text" },
            getValue: (record) => record.code,
            render: (record) => record.code,
          },
          {
            key: "name",
            title: "Название",
            sortable: true,
            filter: { type: "text" },
            getValue: (record) => record.name,
            render: (record) => record.name,
          },
          {
            key: "type",
            title: "Тип",
            sortable: true,
            filter: {
              type: "select",
              options: WAREHOUSE_TYPE_OPTIONS,
            },
            getValue: (record) => record.type,
            render: (record) => getWarehouseTypeLabel(record.type),
          },
          {
            key: "address",
            title: "Адрес",
            getValue: (record) => record.fullAddress ?? record.city ?? "",
            render: (record) => record.fullAddress ?? record.city ?? "—",
          },
          {
            key: "configured",
            title: "Готовность",
            sortable: true,
            getValue: (record) =>
              record.isConfigured ? "Настроен" : "Не настроен",
            render: (record) => (
              <StatusBadge
                text={record.isConfigured ? "Настроен" : "Не настроен"}
                variant={record.isConfigured ? "access" : "warning"}
              />
            ),
          },
          {
            key: "products",
            title: "Товары",
            sortable: true,
            getValue: (record) => record.productsCount,
            render: (record) =>
              `${record.productsCount} (${record.primaryProductsCount} основных)`,
          },
        ]}
      />
    );
  }

  if (props.tabId === "delivery-providers") {
    const records = buildDeliveryProviderTree(props.providers);
    const openRecord = (record: DeliveryProviderTreeRecord) =>
      record.type === "provider"
        ? props.onOpen({ type: "provider", provider: record.provider })
        : props.onOpen({
            type: "service",
            provider: record.provider,
            service: record.service,
          });
    if (props.viewMode === "list")
      return (
        <div className="grid gap-3 md:grid-cols-2">
          {records
            .flatMap((record) => [record, ...(record.children ?? [])])
            .map((record) => (
              <article
                key={`${record.type}:${record.id}`}
                className="rounded-2xl border border-border/80 p-4"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{record.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {record.type === "service" ? "Сервис · " : "Провайдер · "}
                      {record.code}
                    </div>
                  </div>
                  <StatusBadge
                    text={record.isActive ? "Активен" : "Отключён"}
                    variant={record.isActive ? "access" : "destructive"}
                  />
                </div>
                <Actions canEdit onOpen={() => openRecord(record)} />
              </article>
            ))}
        </div>
      );
    return (
      <AdminRecordsTable
        tableKey="delivery-providers"
        records={records}
        getRecordKey={(record) => `${record.type}:${record.id}`}
        emptyText="Провайдеры доставки не настроены."
        renderActions={(record) => (
          <Actions canEdit onOpen={() => openRecord(record)} />
        )}
        getSubRows={(record) => record.children ?? []}
        autoExpandIds={
          props.searchValue.trim()
            ? records.map((record) => `${record.type}:${record.id}`)
            : []
        }
        columns={[
          {
            key: "id",
            title: "ID",
            width: 100,
            getValue: (record) => record.id,
            render: (record) => <AdminShortId value={record.id} />,
          },
          {
            key: "type",
            title: "Тип",
            getValue: (record) => record.type,
            render: (record) =>
              record.type === "provider" ? "Провайдер" : "Сервис",
          },
          {
            key: "code",
            title: "Код",
            sortable: true,
            getValue: (record) => record.code,
            render: (record) => record.code,
          },
          {
            key: "name",
            title: "Провайдер / сервис",
            sortable: true,
            filter: { type: "text" },
            getValue: (record) =>
              record.type === "provider"
                ? [
                    record.name,
                    ...record.children.map((child) => child.name),
                  ].join(" ")
                : record.name,
            render: (record) => record.name,
          },
          {
            key: "active",
            title: "Статус",
            getValue: (record) => (record.isActive ? "Активен" : "Отключён"),
            render: (record) => (
              <StatusBadge
                text={record.isActive ? "Активен" : "Отключён"}
                variant={record.isActive ? "access" : "destructive"}
              />
            ),
          },
        ]}
      />
    );
  }

  if (props.tabId === "universal-delivery-quotes")
    return (
      <AdminRecordsTable
        tableKey="universal-delivery-quotes"
        records={props.quotes}
        getRecordKey={(record) => record.id}
        emptyText="Универсальных расчётов пока нет."
        renderActions={(quote) => (
          <Actions onOpen={() => props.onOpen({ type: "quote", quote })} />
        )}
        columns={[
          {
            key: "id",
            title: "ID",
            getValue: (record) => record.id,
            render: (record) => record.id.slice(0, 8),
          },
          {
            key: "status",
            title: "Статус",
            sortable: true,
            filter: { type: "text" },
            getValue: (record) => record.status,
            render: (record) => (
              <StatusBadge
                text={record.status}
                variant={getQuoteStatusVariant(record.status)}
              />
            ),
          },
          {
            key: "provider",
            title: "Сервис",
            getValue: (record) => record.deliveryService.name,
            render: (record) =>
              `${record.deliveryProvider.name} · ${record.deliveryService.name}`,
          },
          {
            key: "destination",
            title: "Назначение",
            getValue: (record) => record.destinationSummary,
            render: (record) => record.destinationSummary,
          },
          {
            key: "charge",
            title: "Для клиента",
            align: "right",
            getValue: (record) => record.customerCharge,
            render: (record) => formatPrice(record.customerCharge),
          },
          {
            key: "createdAt",
            title: "Создан",
            sortable: true,
            filter: { type: "dateRange" },
            getValue: (record) => record.createdAt,
            render: (record) =>
              new Date(record.createdAt).toLocaleString("ru-RU"),
          },
        ]}
      />
    );

  return (
    <AdminRecordsTable
      tableKey="shipments"
      records={props.shipments}
      getRecordKey={(record) => record.id}
      emptyText="Отправлений пока нет."
      renderActions={(shipment) => (
        <Actions onOpen={() => props.onOpen({ type: "shipment", shipment })} />
      )}
      columns={[
        {
          key: "id",
          title: "ID",
          getValue: (record) => record.id,
          render: (record) => record.id.slice(0, 8),
        },
        {
          key: "order",
          title: "Заказ",
          filter: { type: "text" },
          getValue: (record) => record.orderId,
          render: (record) => record.orderId.slice(0, 8),
        },
        {
          key: "status",
          title: "Статус",
          sortable: true,
          getValue: (record) => record.status,
          render: (record) => (
            <StatusBadge
              text={record.status}
              variant={getShipmentStatusVariant(record.status)}
            />
          ),
        },
        {
          key: "service",
          title: "Сервис",
          getValue: (record) => record.deliveryService.name,
          render: (record) => record.deliveryService.name,
        },
        {
          key: "destination",
          title: "Назначение",
          getValue: (record) => record.destinationSummary,
          render: (record) => record.destinationSummary,
        },
        {
          key: "items",
          title: "Позиций",
          getValue: (record) => record.itemsCount,
          render: (record) => record.itemsCount,
        },
        {
          key: "createdAt",
          title: "Создано",
          sortable: true,
          filter: { type: "dateRange" },
          getValue: (record) => record.createdAt,
          render: (record) =>
            new Date(record.createdAt).toLocaleString("ru-RU"),
        },
      ]}
    />
  );
}
