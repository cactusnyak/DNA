import { useMemo } from 'react';

import { USER_ROLE_LABELS } from '@/entities/user';

import { filterAdminRecords } from '../../../logic/filter-admin-records';
import type {
  AdminCatalogData,
  FilteredAdminRecords,
} from '../types/admin-management-records';

export function useFilteredAdminRecords(
  data: AdminCatalogData | undefined,
  searchValue: string,
): FilteredAdminRecords {
  const filteredMarketCategories = useMemo(
    () =>
      filterAdminRecords(
        data?.marketCategories ?? [],
        searchValue,
        (category) => [
          category.name,
          category.slug,
          category.path,
          category.description,
        ],
      ),
    [data?.marketCategories, searchValue],
  );

  const filteredProducts = useMemo(
    () =>
      filterAdminRecords(data?.products ?? [], searchValue, (product) => [
        product.title,
        product.slug,
        product.description,
        product.price,
        product.category?.name,
      ]),
    [data?.products, searchValue],
  );

  const filteredCollections = useMemo(
    () =>
      filterAdminRecords(data?.collections ?? [], searchValue, (collection) => [
        collection.title,
        collection.slug,
        collection.description,
        collection.type,
      ]),
    [data?.collections, searchValue],
  );

  const filteredOrders = useMemo(
    () =>
      filterAdminRecords(data?.orders ?? [], searchValue, (order) => [
        order.id,
        order.customerName,
        order.customerPhone,
        order.customerEmail,
        order.deliveryAddress,
        order.status,
        order.totalAmount,
      ]),
    [data?.orders, searchValue],
  );

  const filteredAdCategories = useMemo(
    () =>
      filterAdminRecords(data?.adCategories ?? [], searchValue, (category) => [
        category.name,
        category.slug,
        category.path,
        category.description,
      ]),
    [data?.adCategories, searchValue],
  );

  const filteredAds = useMemo(
    () =>
      filterAdminRecords(data?.ads ?? [], searchValue, (ad) => [
        ad.title,
        ad.slug,
        ad.description,
        ad.price,
        ad.category?.name,
        ad.seller ? `${ad.seller.firstName} ${ad.seller.lastName}` : undefined,
        ad.seller?.email,
      ]),
    [data?.ads, searchValue],
  );

  const filteredUsers = useMemo(
    () =>
      filterAdminRecords(data?.users ?? [], searchValue, (user) => [
        user.firstName,
        user.lastName,
        user.email,
        user.phone,
        USER_ROLE_LABELS[user.role],
      ]),
    [data?.users, searchValue],
  );

  return {
    marketCategories: filteredMarketCategories,
    products: filteredProducts,
    collections: filteredCollections,
    orders: filteredOrders,
    adCategories: filteredAdCategories,
    ads: filteredAds,
    users: filteredUsers,
  };
}
