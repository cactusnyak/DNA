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

export type AdminCrudFormValues = Record<string, string | boolean>;

export type AdminCrudUpdateValue = (
  field: string,
  value: string | boolean,
) => void;

export type AdminCrudFieldsProps = {
  tabId: AdminManagementTabId;
  values: AdminCrudFormValues;
  categories: AdminCategory[];
  record?: AdminCrudRecord;
  onValueChange: AdminCrudUpdateValue;
};
