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
import { AdminRecordsTable } from "../../../AdminRecordsTable";
import type {
  AdminManagementTabId,
  AdminViewMode,
} from "../../../../types/admin-management";

type Props = {
  tabId: AdminManagementTabId;
  viewMode: AdminViewMode;
  warehouses: AdminWarehouse[];
  providers: AdminDeliveryProvider[];
  quotes: AdminUniversalQuote[];
  shipments: AdminShipment[];
  onOpen: (record: AdminLogisticsRecord) => void;
  onDeleteWarehouse: (warehouse: AdminWarehouse) => void;
};

type ProviderTableRecord =
  | {
      type: "provider";
      id: string;
      code: string;
      name: string;
      isActive: boolean;
      deletedAt?: null;
      provider: AdminDeliveryProvider;
    }
  | {
      type: "service";
      id: string;
      code: string;
      name: string;
      isActive: boolean;
      deletedAt?: null;
      provider: AdminDeliveryProvider;
      service: AdminDeliveryProvider["services"][number];
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
                    {warehouse.code}
                  </div>
                </div>
                <StatusBadge
                  text={warehouse.isActive ? "Активен" : "Отключён"}
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
              options: ["OWN", "SELLER", "FULFILLMENT"].map((value) => ({
                value,
                label: value,
              })),
            },
            getValue: (record) => record.type,
            render: (record) => record.type,
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
    const records: ProviderTableRecord[] = props.providers.flatMap(
      (provider) => [
        {
          type: "provider" as const,
          id: provider.id,
          code: provider.code,
          name: provider.name,
          isActive: provider.isActive,
          provider,
        },
        ...provider.services.map((service) => ({
          type: "service" as const,
          id: service.id,
          code: service.code,
          name: service.name,
          isActive: service.isActive,
          provider,
          service,
        })),
      ],
    );
    const openRecord = (record: ProviderTableRecord) =>
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
          {records.map((record) => (
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
                <StatusBadge text={record.isActive ? "Активен" : "Отключён"} />
              </div>
              <Actions canEdit onOpen={() => openRecord(record)} />
            </article>
          ))}
        </div>
      );
    return (
      <AdminRecordsTable
        records={records}
        getRecordKey={(record) => `${record.type}:${record.id}`}
        emptyText="Провайдеры доставки не настроены."
        renderActions={(record) => (
          <Actions canEdit onOpen={() => openRecord(record)} />
        )}
        columns={[
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
            getValue: (record) => record.name,
            render: (record) =>
              record.type === "service" ? `↳ ${record.name}` : record.name,
          },
          {
            key: "active",
            title: "Статус",
            getValue: (record) => (record.isActive ? "Активен" : "Отключён"),
            render: (record) => (
              <StatusBadge text={record.isActive ? "Активен" : "Отключён"} />
            ),
          },
        ]}
      />
    );
  }

  if (props.tabId === "universal-delivery-quotes")
    return (
      <AdminRecordsTable
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
            render: (record) => <StatusBadge text={record.status} />,
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
              variant={
                record.status === "MANUAL_REVIEW" ? "warning" : undefined
              }
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
