import type { AdStatus } from '@/entities/ad';
import type { AdCategory } from '@/entities/ad-category';
import type { MarketCategory } from '@/entities/market-category';
import type { Order } from '@/entities/order';
import type { Product } from '@/entities/product';
import type { UserRole } from '@/entities/user';
import type { Image } from '@/shared/types/image';

export type AdminCatalogCollectionType = 'CATEGORY' | 'PRODUCT';

export type AdminMarketCategory = MarketCategory & {
  isActive: boolean;
  deletedAt?: string | null;
  productsCount: number;
};

export type AdminProduct = Product & {
  categoryId: string;
  isActive: boolean;
  deletedAt?: string | null;
};

export type AdminAdCategory = AdCategory & {
  isActive: boolean;
  deletedAt?: string | null;
  adsCount: number;
};

export type AdminAdSeller = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
};

export type AdminAd = {
  id: string;
  categoryId: string;
  category?: AdminAdCategory;
  seller?: AdminAdSeller;
  title: string;
  slug: string;
  description: string;
  price: number;
  status: AdStatus;
  moderatedAt?: string | null;
  isActive: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  images: Image[];
};

export type AdminUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  referralCode?: string;
  isActive: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  adsCount: number;
  ordersCount: number;
};

export type AdminCatalogCollectionCategory = {
  sortOrder: number;
  category: AdminMarketCategory;
};

export type AdminCatalogCollectionProduct = {
  sortOrder: number;
  product: AdminProduct;
};

export type AdminCatalogCollection = {
  id: string;
  slug: string;
  type: AdminCatalogCollectionType;
  title: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  categories: AdminCatalogCollectionCategory[];
  products: AdminCatalogCollectionProduct[];
};

export type AdminCatalogData = {
  marketCategories: AdminMarketCategory[];
  products: AdminProduct[];
  collections: AdminCatalogCollection[];
  orders: Order[];
  adCategories: AdminAdCategory[];
  ads: AdminAd[];
  users: AdminUser[];
};

export type AdminUploadImageResponse = {
  url: string;
  fileName: string;
};

export type AdminMarketCategoryPayload = {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string;
  sortOrder: number;
  imageUrl?: string;
  imageAlt?: string;
  isActive: boolean;
};

export type AdminProductPayload = {
  title: string;
  slug?: string;
  description: string;
  categoryId: string;
  price: number;
  imageUrls: string[];
  isActive: boolean;
};

export type AdminAdCategoryPayload = {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string;
  sortOrder: number;
  imageUrl?: string;
  imageAlt?: string;
  isActive: boolean;
};

export type AdminAdPayload = {
  title: string;
  slug?: string;
  description: string;
  categoryId: string;
  price: number;
  status: AdStatus;
  imageUrls: string[];
  isActive: boolean;
};

export type AdminUserRolePayload = {
  role: UserRole;
};

export type AdminCatalogCollectionPayload = {
  title: string;
  slug?: string;
  type: AdminCatalogCollectionType;
  description?: string;
  isActive: boolean;
};

export type AdminCatalogCollectionItemPayload = {
  id: string;
  sortOrder: number;
};
