import type { AdminDeliveryProvider, AdminWarehouse } from "@/entities/admin";

export function buildWarehouseOptions(
  warehouses: AdminWarehouse[],
  selectedIds: string[],
) {
  return warehouses.map((warehouse) => ({
    value: warehouse.id,
    label: warehouse.name,
    disabled: !warehouse.isActive && !selectedIds.includes(warehouse.id),
  }));
}

export function buildDeliveryServiceOptions(
  providers: AdminDeliveryProvider[],
  selectedIds: string[],
) {
  return providers.flatMap((provider) =>
    provider.services
      .filter((service) => service.isActive || selectedIds.includes(service.id))
      .map((service) => {
        const isAvailable = provider.isActive && service.isActive;
        return {
          value: service.id,
          label: `${provider.name} · ${service.name}${isAvailable ? "" : " · отключён"}`,
          disabled: !isAvailable && !selectedIds.includes(service.id),
        };
      }),
  );
}
