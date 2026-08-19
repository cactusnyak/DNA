/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unnecessary-type-assertion */
import { Injectable, NotFoundException } from '@nestjs/common';
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

type Owner = { userId?: string; guestSessionId?: string };
type DestinationInput = DeliveryAddress & {
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
  ) {}

  async calculate(orderId: string, raw: Record<string, unknown>, owner: Owner) {
    const destination = this.parseDestination(raw);
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
                shippingProfile: {
                  include: { packages: { orderBy: { sequence: 'asc' } } },
                },
                warehouses: {
                  where: { isPrimary: true, isActive: true },
                  include: {
                    warehouse: { include: { providerConfigs: true } },
                  },
                },
                deliveryServices: {
                  where: { isEnabled: true },
                  include: { deliveryService: { include: { provider: true } } },
                },
              },
            },
          },
        },
      },
    });
    if (
      !order ||
      (order.userId
        ? order.userId !== owner.userId
        : !owner.guestSessionId ||
          order.guestSessionId !== owner.guestSessionId)
    )
      throw new NotFoundException('Order not found');
    if (order.status !== OrderStatus.AWAITING_PAYMENT)
      throw new DeliveryProviderError(
        'ORDER_NOT_QUOTABLE',
        'Для заказа в текущем статусе нельзя рассчитать доставку.',
      );

    const grouped = new Map<string, any[]>();
    for (const item of order.items) {
      if (!item.product.deliveryServices.length) continue;
      const primary = item.product.warehouses[0];
      if (!primary)
        throw new DeliveryProviderError(
          'PRIMARY_WAREHOUSE_REQUIRED',
          `Для товара «${item.productTitle ?? item.product.title}» не выбран основной склад.`,
        );
      if (!primary.warehouse.isActive || !primary.warehouse.isConfigured)
        throw new DeliveryProviderError(
          'WAREHOUSE_NOT_CONFIGURED',
          `Склад товара «${item.productTitle ?? item.product.title}» не готов к доставке.`,
        );
      const key = primary.warehouseId;
      grouped.set(key, [...(grouped.get(key) ?? []), { ...item, primary }]);
    }
    if (!grouped.size)
      throw new DeliveryProviderError(
        'NO_DELIVERABLE_ITEMS',
        'В заказе нет товаров с доступной доставкой.',
      );

    const groups: Array<Record<string, unknown>> = [];
    for (const [warehouseId, items] of grouped)
      groups.push(
        await this.calculateGroup(
          order,
          warehouseId,
          items,
          destination,
          owner,
        ),
      );
    return { orderId, groups };
  }

  private async calculateGroup(
    order: any,
    warehouseId: string,
    items: any[],
    destination: DestinationInput,
    owner: Owner,
  ) {
    const warehouse = items[0].primary.warehouse;
    const serviceSets = items.map(
      (item) =>
        new Set(
          item.product.deliveryServices.map(
            (mapping: any) => mapping.deliveryServiceId,
          ),
        ),
    );
    const commonServiceIds = [...serviceSets[0]].filter((id) =>
      serviceSets.every((set) => set.has(id)),
    );
    const mappings = items[0].product.deliveryServices.filter(
      (mapping: any) =>
        commonServiceIds.includes(mapping.deliveryServiceId) &&
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
    const groupKey = createDeliveryFingerprint({
      warehouseId,
      orderItemIds: items.map((item) => item.id).sort(),
    }).slice(0, 24);
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
        const serviceCodes = providerMappings.map(
          (mapping: any) => mapping.deliveryService.code,
        );
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
        const fingerprint = createDeliveryFingerprint({
          version: 1,
          orderId: order.id,
          groupKey,
          providerCode: provider.code,
          serviceCodes,
          destination,
          packages,
        });
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
              options: await this.registry
                .get(provider.code)
                .calculateQuotes(request),
            });
        providers.push({ code: provider.code, name: provider.name, options });
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
          const quote = await tx.deliveryQuote.create({
            data: {
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
            },
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
      providerCost: option.providerCost,
      markup,
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
    return { quoteId: quote.id, ...payload.normalizedOption };
  }

  private parseDestination(body: Record<string, unknown>): DestinationInput {
    const required = (key: string) => {
      const value = body[key];
      if (typeof value !== 'string' || !value.trim())
        throw new DeliveryProviderError(
          'DESTINATION_INCOMPLETE',
          `Поле ${key} обязательно.`,
        );
      return value.trim();
    };
    const coordinate = (key: string) =>
      body[key] == null || body[key] === '' ? undefined : Number(body[key]);
    return {
      country: required('country'),
      region: typeof body.region === 'string' ? body.region.trim() : undefined,
      city: required('city'),
      street: typeof body.street === 'string' ? body.street.trim() : undefined,
      building:
        typeof body.building === 'string' ? body.building.trim() : undefined,
      fullAddress: required('fullAddress'),
      postalCode:
        typeof body.postalCode === 'string'
          ? body.postalCode.trim()
          : undefined,
      latitude: coordinate('latitude'),
      longitude: coordinate('longitude'),
      recipientName: required('recipientName'),
      recipientPhone: required('recipientPhone'),
      recipientEmail:
        typeof body.recipientEmail === 'string'
          ? body.recipientEmail.trim()
          : undefined,
      externalPickupPointId:
        typeof body.externalPickupPointId === 'string'
          ? body.externalPickupPointId.trim()
          : undefined,
    };
  }
}
