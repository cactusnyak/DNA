import { useMemo } from 'react';

import { USER_ROLE_LABELS } from '@/entities/user';
import { contentDescriptionToPlainText } from '@/shared/utils/content-description';

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
        contentDescriptionToPlainText(product.description),
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

  const filteredDeliveryQuotes = useMemo(
    () =>
      filterAdminRecords(data?.deliveryQuotes ?? [], searchValue, (quote) => [
        quote.id,
        quote.productId,
        quote.product.title,
        quote.customerName,
        quote.customerPhone,
        quote.customerEmail,
        quote.status,
      ]),
    [data?.deliveryQuotes, searchValue],
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
        contentDescriptionToPlainText(ad.description),
        ad.price,
        ad.category?.name,
        ad.seller?.nickname,
        ad.seller?.nicknameSuffix,
        ad.seller?.email,
      ]),
    [data?.ads, searchValue],
  );

  const filteredUsers = useMemo(
    () =>
      filterAdminRecords(data?.users ?? [], searchValue, (user) => [
        user.nickname,
        user.nicknameSuffix,
        user.email,
        user.phone,
        USER_ROLE_LABELS[user.role],
      ]),
    [data?.users, searchValue],
  );

  const filteredReferrals = useMemo(
    () =>
      filterAdminRecords(data?.referrals ?? [], searchValue, (ref) => [
        ref.nickname,
        ref.nicknameSuffix,
        ref.email,
        ref.phone ?? undefined,
        ref.referralCode ?? undefined,
        ref.invitedBy ?? undefined,
      ]),
    [data?.referrals, searchValue],
  );
  const filteredWarehouses = useMemo(() => filterAdminRecords(data?.warehouses ?? [], searchValue, (item) => [item.code, item.name, item.city ?? undefined, item.region ?? undefined, item.fullAddress ?? undefined]), [data?.warehouses, searchValue]);
  const filteredProviders = useMemo(() => filterAdminRecords(data?.deliveryProviders ?? [], searchValue, (item) => [item.code, item.name, ...item.services.flatMap((service) => [service.code, service.name])]), [data?.deliveryProviders, searchValue]);
  const filteredUniversalQuotes = useMemo(() => filterAdminRecords(data?.universalDeliveryQuotes ?? [], searchValue, (item) => [item.id, item.status, item.destinationSummary, item.deliveryProvider.name, item.deliveryService.name]), [data?.universalDeliveryQuotes, searchValue]);
  const filteredShipments = useMemo(() => filterAdminRecords(data?.shipments ?? [], searchValue, (item) => [item.id, item.orderId, item.status, item.providerOrderId ?? undefined, item.trackingId ?? undefined, item.destinationSummary]), [data?.shipments, searchValue]);

  return {
    marketCategories: filteredMarketCategories,
    products: filteredProducts,
    collections: filteredCollections,
    orders: filteredOrders,
    deliveryQuotes: filteredDeliveryQuotes,
    adCategories: filteredAdCategories,
    ads: filteredAds,
    users: filteredUsers,
    referrals: filteredReferrals,
    warehouses: filteredWarehouses,
    deliveryProviders: filteredProviders,
    universalDeliveryQuotes: filteredUniversalQuotes,
    shipments: filteredShipments,
  };
}
