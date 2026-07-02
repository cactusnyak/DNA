import type { Category } from '@/entities/category';
import type { Order } from '@/entities/order';
import type { Product } from '@/entities/product';

export type AdminCatalogCollectionType = 'CATEGORY' | 'PRODUCT';

export type AdminCategory = Category & {
  isActive: boolean;
  deletedAt?: string | null;
  productsCount: number;
};

export type AdminProduct = Product & {
  categoryId: string;
  isActive: boolean;
  deletedAt?: string | null;
};

export type AdminCatalogCollectionCategory = {
  sortOrder: number;
  category: AdminCategory;
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
  categories: AdminCategory[];
  products: AdminProduct[];
  collections: AdminCatalogCollection[];
  orders: Order[];
};

export type AdminUploadImageResponse = {
  url: string;
  fileName: string;
};

export type AdminCategoryPayload = {
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
