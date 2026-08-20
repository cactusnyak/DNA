/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unnecessary-type-assertion */
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { OrderStatus, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import type {
  DeliveryAddress,
  DeliveryQuoteOption,
} from './contracts/delivery-provider.types';
import {
  DeliveryProviderError,
  toUnavailableReason,
} from './delivery-provider.error';
import { DeliveryProviderRegistry } from './delivery-provider.registry';
import { EffectiveShippingProfileResolver } from './effective-shipping-profile.resolver';
import { createDeliveryFingerprint } from './utils/delivery-fingerprint';
import { OrderDeliveryService } from './order-delivery.service';
import type { ResolvedDeliveryGroup } from './delivery-group.resolver';

type Owner = { userId?: string; guestSessionId?: string };
type DestinationInput = DeliveryAddress & {
  version: number;
  recipientName: string;
  recipientPhone: string;
  recipientEmail?: string;
  externalPickupPointId?: string;
};

@Injectable()
export class DeliveryQuoteOrchestrator {
  constructor(
    private readonly prisma: PrismaService,
    private readonly registry: DeliveryProviderRegistry,
    private readonly profiles: EffectiveShippingProfileResolver,
    private readonly delivery: OrderDeliveryService,
  ) {}

  async calculate(
    orderId: string,
    _raw: Record<string, unknown>,
    owner: Owner,
  ) {
    const order = await this.delivery.getOwnedOrder(orderId, owner);
    if (order.status !== OrderStatus.AWAITING_PAYMENT)
      throw new DeliveryProviderError(
        'ORDER_NOT_QUOTABLE',
        'Для заказа в текущем статусе нельзя рассчитать доставку.',
      );

    const destination = order.deliveryDestination as DestinationInput | null;
    const resolution = this.delivery.resolve(order);
    if (!destination && resolution.groups.length)
      throw new DeliveryProviderError(
        'DESTINATION_REQUIRED',
        'Сначала подтвердите адрес доставки.',
      );
    await this.prisma.deliveryQuote.updateMany({
      where: { orderId, status: 'CREATED', expiresAt: { lte: new Date() } },
      data: { status: 'EXPIRED', quoteKey: null },
    });
    const groups: Array<Record<string, unknown>> = [];
    for (const group of resolution.groups) {
      try {
        groups.push(
          await this.calculateGroup(order, group, destination!, owner),
        );
      } catch (error) {
        groups.push({
          groupKey: group.groupKey,
          warehouse: group.warehouse,
          orderItemIds: group.items.map((item) => item.id),
          providers: [],
          error: toUnavailableReason(error),
        });
      }
    }
    const allGroupsHaveOptions = groups.every((group) =>
      (group.providers as Array<{ options?: unknown[] }>).some(
        (provider) => (provider.options?.length ?? 0) > 0,
      ),
    );
    return {
      orderId,
      groups,
      unavailableItems: resolution.unavailableItems,
      readiness:
        resolution.unavailableItems.length ||
        groups.some((group) => 'error' in group) ||
        !allGroupsHaveOptions
          ? 'BLOCKED'
          : 'SELECTION_REQUIRED',
      readyForSelection:
        !resolution.unavailableItems.length &&
        groups.every((group) => !('error' in group)) &&
        allGroupsHaveOptions,
    };
  }

  private async calculateGroup(
    order: any,
    group: ResolvedDeliveryGroup,
    destination: DestinationInput,
    owner: Owner,
  ) {
    const items = group.items.map((groupItem) => {
      const item = order.items.find((value: any) => value.id === groupItem.id);
      const primary = item.product.warehouses.find(
        (mapping: any) => mapping.warehouseId === group.warehouse.id,
      );
      return { ...item, primary };
    });
    const warehouse = items[0].primary.warehouse;
    const mappings = items[0].product.deliveryServices.filter(
      (mapping: any) =>
        group.commonServiceIds.includes(mapping.deliveryServiceId) &&
        mapping.isEnabled &&
        mapping.deliveryService.isActive &&
        mapping.deliveryService.provider.isActive,
    );
    const byProvider = new Map<string, any[]>();
    for (const mapping of mappings)
      byProvider.set(mapping.deliveryService.providerId, [
        ...(byProvider.get(mapping.deliveryService.providerId) ?? []),
        mapping,
      ]);
    const packages = items.flatMap((item) => this.profiles.resolve(item));
    const groupKey = group.groupKey;
    const providers: Array<Record<string, unknown>> = [];
    for (const providerMappings of byProvider.values()) {
      const provider = providerMappings[0].deliveryService.provider;
      try {
        const providerConfig = warehouse.providerConfigs.find(
          (config: any) =>
            config.deliveryProviderId === provider.id && config.isEnabled,
        );
        if (!providerConfig)
          throw new DeliveryProviderError(
            'WAREHOUSE_PROVIDER_NOT_CONFIGURED',
            `Склад не подключён к провайдеру «${provider.name}».`,
          );
        const serviceCodes = providerMappings
          .map((mapping: any) => mapping.deliveryService.code)
          .sort();
        const request = {
          correlationId: randomUUID(),
          groupKey,
          serviceCodes,
          warehouseExternalLocationId:
            providerConfig.externalLocationId ?? undefined,
          origin: {
            country: warehouse.country,
            region: warehouse.region ?? undefined,
            city: warehouse.city,
            street: warehouse.street,
            building: warehouse.building,
            fullAddress: warehouse.fullAddress,
            postalCode: warehouse.postalCode ?? undefined,
            latitude:
              warehouse.latitude?.toNumber?.() ?? Number(warehouse.latitude),
            longitude:
              warehouse.longitude?.toNumber?.() ?? Number(warehouse.longitude),
            contactName: warehouse.contactName,
            contactPhone: warehouse.contactPhone,
          },
          destination,
          packages,
          externalPickupPointId: destination.externalPickupPointId,
        };
        const fingerprint = this.delivery.buildFingerprint(
          order,
          group,
          provider.id,
        );
        const reusable = await this.prisma.deliveryQuote.findMany({
          where: {
            orderId: order.id,
            groupKey,
            fingerprint,
            status: 'CREATED',
            expiresAt: { gt: new Date() },
          },
          include: { deliveryService: true },
          orderBy: { createdAt: 'asc' },
        });
        const options = reusable.length
          ? reusable.map((quote) => this.publicOptionFromQuote(quote))
          : await this.persistOptions({
              order,
              owner,
              groupKey,
              provider,
              mappings: providerMappings,
              fingerprint,
              request,
              originWarehouse: warehouse,
              destinationVersion: destination.version,
              orderDeliveryVersion: order.deliveryVersion,
              options: await this.registry
                .get(provider.code)
                .calculateQuotes(request),
            });
        const publicOptions = options.filter(
          (option) => option.fulfillmentType !== 'PICKUP',
        );
        providers.push({
          code: provider.code,
          name: provider.name,
          options: publicOptions,
          ...(publicOptions.length
            ? {}
            : {
                unavailableReason: {
                  code: 'PICKUP_SELECTION_NOT_AVAILABLE',
                  message:
                    'Доставка до пункта выдачи станет доступна после выбора ПВЗ.',
                },
              }),
        });
      } catch (error) {
        providers.push({
          code: provider.code,
          name: provider.name,
          options: [],
          unavailableReason: toUnavailableReason(error),
        });
      }
    }
    if (!providers.length)
      providers.push({
        code: 'UNAVAILABLE',
        name: 'Доставка',
        options: [],
        unavailableReason: {
          code: 'NO_COMMON_SERVICES',
          message: 'Для товаров группы нет общего сервиса доставки.',
        },
      });
    return {
      groupKey,
      orderItemIds: items.map((item) => item.id),
      warehouse: { id: warehouse.id, name: warehouse.name },
      providers,
    };
  }

  private async persistOptions(params: any) {
    return this.prisma.$transaction(async (tx) =>
      Promise.all(
        params.options.map(async (option: DeliveryQuoteOption) => {
          const service = params.mappings.find(
            (mapping: any) =>
              mapping.deliveryService.code === option.serviceCode,
          )?.deliveryService;
          if (!service)
            throw new DeliveryProviderError(
              'UNSUPPORTED_SERVICE',
              `Сервис ${option.serviceCode} не разрешён для группы.`,
            );
          const markup = Math.max(0, params.provider.fixedMarkup);
          const normalizedOption = this.serializeOption(option, markup);
          const quoteKey = createDeliveryFingerprint({
            fingerprint: params.fingerprint,
            serviceId: service.id,
            providerOfferRef: option.providerOfferRef ?? option.title,
          });
          const data: Prisma.DeliveryQuoteUncheckedCreateInput = {
            deliveryProviderId: params.provider.id,
            deliveryServiceId: service.id,
            userId: params.owner.userId,
            guestSessionId: params.owner.userId
              ? null
              : params.owner.guestSessionId,
            orderId: params.order.id,
            groupKey: params.groupKey,
            status: 'CREATED',
            originWarehouseId: params.originWarehouse.id,
            originSnapshot: {
              version: 1,
              warehouseCode: params.originWarehouse.code,
              address: params.request.origin,
              contact: {
                name: params.request.origin.contactName,
                phone: params.request.origin.contactPhone,
              },
              timezone: params.originWarehouse.timezone,
            },
            destinationSnapshot: {
              version: 1,
              address: params.request.destination,
              recipient: {
                name: params.request.destination.recipientName,
                phone: params.request.destination.recipientPhone,
                email: params.request.destination.recipientEmail,
              },
            },
            cargoSnapshot: { version: 1, items: params.request.packages },
            providerCost: option.providerCost,
            customerCharge: option.providerCost + markup,
            subsidyAmount: 0,
            markupAmount: markup,
            expiresAt: option.expiresAt,
            providerQuoteId: option.providerOfferRef,
            providerPayload: JSON.parse(
              JSON.stringify({
                version: 1,
                contour: option.contour,
                mode: option.mode,
                rawProviderPrice: option.rawProviderPrice,
                offerPayload: option.privateProviderPayload ?? null,
                normalizedOption,
              }),
            ) as Prisma.InputJsonValue,
            fingerprint: params.fingerprint,
            quoteKey,
            destinationVersion: params.destinationVersion,
            orderDeliveryVersion: params.orderDeliveryVersion,
          };
          const quote = await tx.deliveryQuote.upsert({
            where: { quoteKey },
            create: data,
            update: {},
          });
          return { quoteId: quote.id, ...normalizedOption };
        }),
      ),
    );
  }

  private serializeOption(option: DeliveryQuoteOption, markup: number) {
    return {
      serviceCode: option.serviceCode,
      title: option.title,
      description: option.description,
      fulfillmentType: option.fulfillmentType,
      customerPrice: option.providerCost + markup,
      currency: option.currency,
      pickupInterval: option.pickupInterval,
      deliveryInterval: option.deliveryInterval,
      expiresAt: option.expiresAt.toISOString(),
      pickupPoint: option.pickupPoint,
    };
  }

  private publicOptionFromQuote(quote: any) {
    const payload = quote.providerPayload as any;
    const {
      providerCost: _providerCost,
      markup: _markup,
      pickupPoint: _pickupPoint,
      ...publicOption
    } = payload.normalizedOption;
    return { quoteId: quote.id, ...publicOption };
  }
}
