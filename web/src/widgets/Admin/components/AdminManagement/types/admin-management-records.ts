import type {
  AdminCatalogCollection,
  AdminCategory,
  AdminProduct,
} from '@/entities/admin';
import type { Order } from '@/entities/order';

export type EditableRecord =
  | AdminCategory
  | AdminProduct
  | AdminCatalogCollection
  | Order;

export type AdminCatalogData = {
  categories: AdminCategory[];
  products: AdminProduct[];
  collections: AdminCatalogCollection[];
  orders: Order[];
};

export type FilteredAdminRecords = AdminCatalogData;
