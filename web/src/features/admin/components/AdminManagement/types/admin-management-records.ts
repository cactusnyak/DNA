import type {
  AdminAd,
  AdminAdCategory,
  AdminCatalogCollection,
  AdminMarketCategory,
  AdminProduct,
  AdminReferralUser,
  AdminUser,
} from '@/entities/admin';
import type { Order } from '@/entities/order';
import type { DeliveryQuote } from '@/entities/delivery-quote';

export type AdminDeliveryQuote = DeliveryQuote & {
  deletedAt?: null;
  product: { title: string };
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerComment?: string;
  accessRestrictions?: string;
  unloadingRequired: boolean;
};

export type AdminCrudRecord =
  | AdminMarketCategory
  | AdminProduct
  | AdminCatalogCollection
  | Order
  | AdminAdCategory
  | AdminAd
  | AdminUser;

export type EditableRecord = AdminCrudRecord | AdminDeliveryQuote;

export type AdminCatalogData = {
  marketCategories: AdminMarketCategory[];
  products: AdminProduct[];
  collections: AdminCatalogCollection[];
  orders: Order[];
  deliveryQuotes: AdminDeliveryQuote[];
  adCategories: AdminAdCategory[];
  ads: AdminAd[];
  users: AdminUser[];
  referrals: AdminReferralUser[];
};

export type FilteredAdminRecords = AdminCatalogData;
