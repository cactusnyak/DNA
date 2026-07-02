import { useMemo } from 'react';

import { filterAdminRecords } from '../../../logic/filter-admin-records';
import type {
  AdminCatalogData,
  FilteredAdminRecords,
} from '../types/admin-management-records';

export function useFilteredAdminRecords(
  data: AdminCatalogData | undefined,
  searchValue: string,
): FilteredAdminRecords {
  const filteredCategories = useMemo(
    () =>
      filterAdminRecords(data?.categories ?? [], searchValue, (category) => [
        category.name,
        category.slug,
        category.path,
        category.description,
      ]),
    [data?.categories, searchValue],
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

  return {
    categories: filteredCategories,
    products: filteredProducts,
    collections: filteredCollections,
    orders: filteredOrders,
  };
}
