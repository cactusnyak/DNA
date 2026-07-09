import type {
  AdminAd,
  AdminAdCategory,
  AdminCatalogCollection,
  AdminMarketCategory,
  AdminProduct,
  AdminUser,
} from '@/entities/admin';
import type { AdminReferralUser } from '@/entities/admin';
import type { Order } from '@/entities/order';

export type EditableRecord =
  | AdminMarketCategory
  | AdminProduct
  | AdminCatalogCollection
  | Order
  | AdminAdCategory
  | AdminAd
  | AdminUser
  | AdminReferralUser;

export type AdminCatalogData = {
  marketCategories: AdminMarketCategory[];
  products: AdminProduct[];
  collections: AdminCatalogCollection[];
  orders: Order[];
  adCategories: AdminAdCategory[];
  ads: AdminAd[];
  users: AdminUser[];
  referrals: AdminReferralUser[];
};

export type FilteredAdminRecords = AdminCatalogData;
