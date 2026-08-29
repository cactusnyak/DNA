import type { WarehouseType } from "@/entities/admin";

export const WAREHOUSE_TYPE_LABELS: Record<WarehouseType, string> = {
  OWN: "Собственный",
  SELLER: "Склад продавца",
  FULFILLMENT: "Фулфилмент",
};

export const WAREHOUSE_TYPE_OPTIONS = Object.entries(WAREHOUSE_TYPE_LABELS).map(
  ([value, label]) => ({ value: value as WarehouseType, label }),
);

export function getWarehouseTypeLabel(value: string) {
  return WAREHOUSE_TYPE_LABELS[value as WarehouseType] ?? value;
}
