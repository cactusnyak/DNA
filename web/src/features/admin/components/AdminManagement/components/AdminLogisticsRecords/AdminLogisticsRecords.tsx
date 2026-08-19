import { Eye, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type {
  AdminDeliveryProvider,
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
  onOpen: (
    record:
      | AdminWarehouse
      | AdminDeliveryProvider
      | AdminUniversalQuote
      | AdminShipment,
  ) => void;
  onDeleteWarehouse: (warehouse: AdminWarehouse) => void;
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
  const openLabel = canEdit ? "Изменить склад" : "Открыть запись";
  const OpenIcon = canEdit ? Pencil : Eye;
  return (
    <div className="flex justify-end gap-2">
      <Button
        type="button"
        size="icon-sm"
        variant="secondary"
        aria-label={openLabel}
        title={openLabel}
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
  const records =
    props.tabId === "warehouses"
      ? props.warehouses
      : props.tabId === "delivery-providers"
        ? props.providers
        : props.tabId === "universal-delivery-quotes"
          ? props.quotes
          : props.shipments;
  if (props.viewMode === "list") {
    return (
      <div className="grid gap-3 md:grid-cols-2">
        {records.map((record) => (
          <article
            key={record.id}
            className="rounded-2xl border border-border/80 p-4"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <div className="font-medium">
                  {"name" in record ? record.name : record.id.slice(0, 8)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {"code" in record
                    ? record.code
                    : "status" in record
                      ? record.status
                      : ""}
                </div>
              </div>
              <StatusBadge
                text={
                  "isActive" in record
                    ? record.isActive
                      ? "Активен"
                      : "Отключён"
                    : "status" in record
                      ? record.status
                      : "—"
                }
              />
            </div>
            <Actions
              onOpen={() => props.onOpen(record)}
              canEdit={props.tabId === "warehouses"}
              canDelete={props.tabId === "warehouses"}
              onDelete={() =>
                "type" in record &&
                props.onDeleteWarehouse(record as AdminWarehouse)
              }
            />
          </article>
        ))}
      </div>
    );
  }
  if (props.tabId === "warehouses")
    return (
      <AdminRecordsTable
        records={props.warehouses}
        getRecordKey={(r) => r.id}
        emptyText="Склады не найдены."
        renderActions={(r) => (
          <Actions
            onOpen={() => props.onOpen(r)}
            canEdit
            canDelete
            onDelete={() => props.onDeleteWarehouse(r)}
          />
        )}
        columns={[
          {
            key: "code",
            title: "Код",
            sortable: true,
            filter: { type: "text" },
            getValue: (r) => r.code,
            render: (r) => r.code,
          },
          {
            key: "name",
            title: "Название",
            sortable: true,
            filter: { type: "text" },
            getValue: (r) => r.name,
            render: (r) => r.name,
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
            getValue: (r) => r.type,
            render: (r) => r.type,
          },
          {
            key: "address",
            title: "Адрес",
            getValue: (r) => r.fullAddress ?? r.city ?? "",
            render: (r) => r.fullAddress ?? r.city ?? "—",
          },
          {
            key: "configured",
            title: "Готовность",
            sortable: true,
            getValue: (r) => (r.isConfigured ? "Настроен" : "Не настроен"),
            render: (r) => (
              <StatusBadge
                text={r.isConfigured ? "Настроен" : "Не настроен"}
                variant={r.isConfigured ? "access" : "warning"}
              />
            ),
          },
          {
            key: "products",
            title: "Товары",
            sortable: true,
            getValue: (r) => r.productsCount,
            render: (r) =>
              `${r.productsCount} (${r.primaryProductsCount} основных)`,
          },
        ]}
      />
    );
  if (props.tabId === "delivery-providers")
    return (
      <AdminRecordsTable
        records={props.providers}
        getRecordKey={(r) => r.id}
        emptyText="Провайдеры не найдены."
        getSubRows={(r) =>
          r.services.map((service) => ({
            ...r,
            id: service.id,
            code: service.code,
            name: service.name,
            isActive: service.isActive,
            services: [],
            _count: { warehouseConfigs: service._count.products },
          }))
        }
        renderActions={(r) => <Actions onOpen={() => props.onOpen(r)} />}
        columns={[
          {
            key: "code",
            title: "Код",
            sortable: true,
            getValue: (r) => r.code,
            render: (r) => r.code,
          },
          {
            key: "name",
            title: "Провайдер / сервис",
            sortable: true,
            filter: { type: "text" },
            getValue: (r) => r.name,
            render: (r) => r.name,
          },
          {
            key: "active",
            title: "Статус",
            getValue: (r) => (r.isActive ? "Активен" : "Отключён"),
            render: (r) => (
              <StatusBadge text={r.isActive ? "Активен" : "Отключён"} />
            ),
          },
          {
            key: "services",
            title: "Сервисы",
            getValue: (r) => r.services.length,
            render: (r) => r.services.length,
          },
        ]}
      />
    );
  if (props.tabId === "universal-delivery-quotes")
    return (
      <AdminRecordsTable
        records={props.quotes}
        getRecordKey={(r) => r.id}
        emptyText="Универсальных расчётов пока нет."
        renderActions={(r) => <Actions onOpen={() => props.onOpen(r)} />}
        columns={[
          {
            key: "id",
            title: "ID",
            getValue: (r) => r.id,
            render: (r) => r.id.slice(0, 8),
          },
          {
            key: "status",
            title: "Статус",
            sortable: true,
            filter: { type: "text" },
            getValue: (r) => r.status,
            render: (r) => <StatusBadge text={r.status} />,
          },
          {
            key: "provider",
            title: "Сервис",
            getValue: (r) => r.deliveryService.name,
            render: (r) =>
              `${r.deliveryProvider.name} · ${r.deliveryService.name}`,
          },
          {
            key: "destination",
            title: "Назначение",
            getValue: (r) => r.destinationSummary,
            render: (r) => r.destinationSummary,
          },
          {
            key: "charge",
            title: "Для клиента",
            align: "right",
            getValue: (r) => r.customerCharge,
            render: (r) => formatPrice(r.customerCharge),
          },
          {
            key: "createdAt",
            title: "Создан",
            sortable: true,
            filter: { type: "dateRange" },
            getValue: (r) => r.createdAt,
            render: (r) => new Date(r.createdAt).toLocaleString("ru-RU"),
          },
        ]}
      />
    );
  return (
    <AdminRecordsTable
      records={props.shipments}
      getRecordKey={(r) => r.id}
      emptyText="Отправлений пока нет."
      renderActions={(r) => <Actions onOpen={() => props.onOpen(r)} />}
      columns={[
        {
          key: "id",
          title: "ID",
          getValue: (r) => r.id,
          render: (r) => r.id.slice(0, 8),
        },
        {
          key: "order",
          title: "Заказ",
          filter: { type: "text" },
          getValue: (r) => r.orderId,
          render: (r) => r.orderId.slice(0, 8),
        },
        {
          key: "status",
          title: "Статус",
          sortable: true,
          getValue: (r) => r.status,
          render: (r) => (
            <StatusBadge
              text={r.status}
              variant={r.status === "MANUAL_REVIEW" ? "warning" : undefined}
            />
          ),
        },
        {
          key: "service",
          title: "Сервис",
          getValue: (r) => r.deliveryService.name,
          render: (r) => r.deliveryService.name,
        },
        {
          key: "destination",
          title: "Назначение",
          getValue: (r) => r.destinationSummary,
          render: (r) => r.destinationSummary,
        },
        {
          key: "items",
          title: "Позиций",
          getValue: (r) => r.itemsCount,
          render: (r) => r.itemsCount,
        },
        {
          key: "createdAt",
          title: "Создано",
          sortable: true,
          filter: { type: "dateRange" },
          getValue: (r) => r.createdAt,
          render: (r) => new Date(r.createdAt).toLocaleString("ru-RU"),
        },
      ]}
    />
  );
}
