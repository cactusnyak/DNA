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
  AdminUser,
  AdminUserRolePayload,
} from '@/entities/admin';
import type { Order, OrderStatus } from '@/entities/order';

import type { AdminManagementTabId } from '../../../types/admin-management';

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
  record?: AdminCrudRecord;
  onValueChange: AdminCrudUpdateValue;
};

export type AdminImageUploader = (file: File) => Promise<string>;
