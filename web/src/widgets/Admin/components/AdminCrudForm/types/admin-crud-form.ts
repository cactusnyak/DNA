import type {
  AdminCatalogCollection,
  AdminCatalogCollectionPayload,
  AdminCategory,
  AdminCategoryPayload,
  AdminProduct,
  AdminProductPayload,
} from '@/entities/admin';
import type { Order, OrderStatus } from '@/entities/order';

import type { AdminManagementTabId } from '../../../types/admin-management';

export type AdminCrudRecord =
  | AdminCategory
  | AdminProduct
  | AdminCatalogCollection
  | Order;

export type AdminCrudPayload =
  | AdminCategoryPayload
  | AdminProductPayload
  | AdminCatalogCollectionPayload
  | { status: OrderStatus };

export type AdminCrudFormValue = string | boolean | File | File[] | string[] | null;

export type AdminCrudFormValues = Record<string, AdminCrudFormValue>;

export type AdminCrudUpdateValue = (
  field: string,
  value: AdminCrudFormValue,
) => void;

export type AdminCrudFieldsProps = {
  tabId: AdminManagementTabId;
  values: AdminCrudFormValues;
  categories: AdminCategory[];
  record?: AdminCrudRecord;
  onValueChange: AdminCrudUpdateValue;
};

export type AdminImageUploader = (file: File) => Promise<string>;
