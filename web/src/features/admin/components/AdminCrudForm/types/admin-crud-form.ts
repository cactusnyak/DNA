import type {
  AdminAd,
  AdminAdCategory,
  AdminAdCategoryPayload,
  AdminAdPayload,
  AdminCatalogCollection,
  AdminCatalogCollectionPayload,
  AdminMarketCategory,
  AdminMarketCategoryPayload,
  AdminProduct,
  AdminProductPayload,
  AdminProductPackage,
  AdminUser,
  AdminUserRolePayload,
} from "@/entities/admin";
import type { Order, OrderStatus } from "@/entities/order";
import type { ProductAddition } from "@/entities/product";

import type { AdminManagementTabId } from "../../../types/admin-management";

export type AdminCrudRecord =
  | AdminMarketCategory
  | AdminProduct
  | AdminCatalogCollection
  | Order
  | AdminAdCategory
  | AdminAd
  | AdminUser;

export type AdminCrudPayload =
  | AdminMarketCategoryPayload
  | AdminProductPayload
  | AdminCatalogCollectionPayload
  | { status: OrderStatus }
  | AdminAdCategoryPayload
  | AdminAdPayload
  | AdminUserRolePayload;

export type AdminCrudFormValue =
  | string
  | boolean
  | File
  | File[]
  | string[]
  | ProductAddition[]
  | AdminProductPackage[]
  | null;

export type AdminCrudFormValues = Record<string, AdminCrudFormValue>;

export type AdminCrudUpdateValue = (
  field: string,
  value: AdminCrudFormValue,
) => void;

export type AdminCrudFieldsProps = {
  tabId: AdminManagementTabId;
  values: AdminCrudFormValues;
  categories: AdminMarketCategory[];
  adCategories: AdminAdCategory[];
  warehouses?: import("@/entities/admin").AdminWarehouse[];
  deliveryProviders?: import("@/entities/admin").AdminDeliveryProvider[];
  logisticsOptionsState?: "loading" | "error" | "ready";
  onRetryLogisticsOptions?: () => void;
  record?: AdminCrudRecord;
  onValueChange: AdminCrudUpdateValue;
};

export type AdminImageUploader = (file: File) => Promise<string>;
