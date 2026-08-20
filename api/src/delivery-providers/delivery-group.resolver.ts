import { Injectable } from '@nestjs/common';

import { createDeliveryFingerprint } from './utils/delivery-fingerprint';

export type DeliveryReadinessCode =
  | 'WAREHOUSE_MISSING'
  | 'WAREHOUSE_INACTIVE'
  | 'WAREHOUSE_NOT_CONFIGURED'
  | 'SHIPPING_PROFILE_MISSING'
  | 'PACKAGE_INVALID'
  | 'DELIVERY_SERVICE_MISSING'
  | 'PROVIDER_DISABLED'
  | 'WAREHOUSE_PROVIDER_CONFIG_MISSING'
  | 'NO_COMPATIBLE_SERVICE'
  | 'QUOTE_UNAVAILABLE';

export type DeliveryUnavailableItem = {
  orderItemId: string;
  title: string;
  quantity: number;
  code: DeliveryReadinessCode;
  message: string;
};

export type DeliveryResolverItem = {
  id: string;
  title: string;
  quantity: number;
  isOversized: boolean;
  warehouse?: {
    id: string;
    name: string;
    isActive: boolean;
    isConfigured: boolean;
  };
  hasShippingProfile: boolean;
  hasValidPackages: boolean;
  serviceIds: string[];
  serviceIssue?: DeliveryReadinessCode;
};

export type ResolvedDeliveryGroup = {
  groupKey: string;
  warehouse: { id: string; name: string };
  items: DeliveryResolverItem[];
  commonServiceIds: string[];
};

@Injectable()
export class DeliveryGroupResolver {
  resolve(
    orderId: string,
    deliveryVersion: number,
    source: DeliveryResolverItem[],
  ) {
    const unavailableItems: DeliveryUnavailableItem[] = [];
    const eligible: DeliveryResolverItem[] = [];

    for (const item of source.filter((value) => !value.isOversized)) {
      const failure = this.failure(item);
      if (failure)
        unavailableItems.push({
          orderItemId: item.id,
          title: item.title,
          quantity: item.quantity,
          ...failure,
        });
      else eligible.push(item);
    }

    const byWarehouse = new Map<string, DeliveryResolverItem[]>();
    for (const item of eligible) {
      const warehouseId = item.warehouse!.id;
      byWarehouse.set(warehouseId, [
        ...(byWarehouse.get(warehouseId) ?? []),
        item,
      ]);
    }

    const groups = [...byWarehouse.values()]
      .sort((a, b) => a[0].warehouse!.id.localeCompare(b[0].warehouse!.id))
      .flatMap((items) => this.partition(items))
      .map((items) => {
        const itemIds = items.map((item) => item.id).sort();
        const commonServiceIds = this.intersection(items).sort();
        return {
          groupKey: createDeliveryFingerprint({
            version: 2,
            orderId,
            deliveryVersion,
            warehouseId: items[0].warehouse!.id,
            orderItemIds: itemIds,
          }).slice(0, 24),
          warehouse: {
            id: items[0].warehouse!.id,
            name: items[0].warehouse!.name,
          },
          items: [...items].sort((a, b) => a.id.localeCompare(b.id)),
          commonServiceIds,
        };
      });

    return { groups, unavailableItems };
  }

  private failure(
    item: DeliveryResolverItem,
  ): Pick<DeliveryUnavailableItem, 'code' | 'message'> | undefined {
    if (!item.warehouse)
      return {
        code: 'WAREHOUSE_MISSING',
        message: 'Для товара не выбран склад отправления.',
      };
    if (!item.warehouse.isActive)
      return {
        code: 'WAREHOUSE_INACTIVE',
        message: 'Склад товара временно недоступен.',
      };
    if (!item.warehouse.isConfigured)
      return {
        code: 'WAREHOUSE_NOT_CONFIGURED',
        message: 'Склад товара ещё не готов к доставке.',
      };
    if (!item.hasShippingProfile)
      return {
        code: 'SHIPPING_PROFILE_MISSING',
        message: 'Для товара не настроены параметры перевозки.',
      };
    if (!item.hasValidPackages)
      return {
        code: 'PACKAGE_INVALID',
        message: 'Для товара не настроена корректная упаковка.',
      };
    if (!item.serviceIds.length)
      return {
        code: item.serviceIssue ?? 'DELIVERY_SERVICE_MISSING',
        message:
          item.serviceIssue === 'PROVIDER_DISABLED'
            ? 'Провайдер доставки товара временно отключён.'
            : item.serviceIssue === 'WAREHOUSE_PROVIDER_CONFIG_MISSING'
              ? 'Склад не подключён к доступному провайдеру доставки.'
              : 'Для товара пока нет доступного способа доставки.',
      };
    return undefined;
  }

  private intersection(items: DeliveryResolverItem[]) {
    const [first, ...rest] = items;
    return first.serviceIds.filter((id) =>
      rest.every((item) => item.serviceIds.includes(id)),
    );
  }

  private partition(items: DeliveryResolverItem[]) {
    const sorted = [...items].sort((a, b) => a.id.localeCompare(b.id));
    if (sorted.length > 12) return this.greedy(sorted);
    let best: DeliveryResolverItem[][] | undefined;
    const visit = (index: number, groups: DeliveryResolverItem[][]) => {
      if (best && groups.length > best.length) return;
      if (index === sorted.length) {
        const signature = groups
          .map((group) => group.map((item) => item.id).join(','))
          .join('|');
        const bestSignature = best
          ?.map((group) => group.map((item) => item.id).join(','))
          .join('|');
        if (
          !best ||
          groups.length < best.length ||
          (groups.length === best.length && signature < bestSignature!)
        )
          best = groups.map((group) => [...group]);
        return;
      }
      const item = sorted[index];
      for (let groupIndex = 0; groupIndex < groups.length; groupIndex += 1) {
        if (!this.intersection([...groups[groupIndex], item]).length) continue;
        groups[groupIndex].push(item);
        visit(index + 1, groups);
        groups[groupIndex].pop();
      }
      groups.push([item]);
      visit(index + 1, groups);
      groups.pop();
    };
    visit(0, []);
    return best ?? [];
  }

  private greedy(items: DeliveryResolverItem[]) {
    const groups: DeliveryResolverItem[][] = [];
    for (const item of items) {
      const candidates = groups
        .map((group, index) => ({
          index,
          common: this.intersection([...group, item]).length,
        }))
        .filter((candidate) => candidate.common > 0)
        .sort((a, b) => b.common - a.common || a.index - b.index);
      if (candidates[0]) groups[candidates[0].index].push(item);
      else groups.push([item]);
    }
    return groups;
  }
}
