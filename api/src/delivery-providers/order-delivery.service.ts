/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, PaymentAttemptStatus, Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';

import { PrismaService } from '../prisma/prisma.service';
import { DeliveryProviderError } from './delivery-provider.error';
import {
  DeliveryGroupResolver,
  type ResolvedDeliveryGroup,
} from './delivery-group.resolver';
import type {
  UpdateOrderDeliverySelectionsDto,
  UpdateOrderDestinationDto,
} from './dto/order-delivery.dto';
import { createDeliveryFingerprint } from './utils/delivery-fingerprint';
import { normalizeRussianPhone } from './utils/logistics-units';
import { calculateOrderPricing } from './order-delivery-pricing';

export type DeliveryOwner = { userId?: string; guestSessionId?: string };
export type OrderDeliveryDestination = {
  country: string;
  region?: string;
  city: string;
  street?: string;
  building?: string;
  apartment?: string;
  postalCode?: string;
  fullAddress: string;
  latitude?: number;
  longitude?: number;
  externalLocationId?: string;
  recipientName: string;
  recipientPhone: string;
  recipientEmail?: string;
  version: number;
};

const ACTIVE_PAYMENT_STATUSES: PaymentAttemptStatus[] = [
  PaymentAttemptStatus.CREATING,
  PaymentAttemptStatus.PENDING,
  PaymentAttemptStatus.WAITING_FOR_CAPTURE,
];

@Injectable()
export class OrderDeliveryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly resolver: DeliveryGroupResolver,
  ) {}

  async getOwnedOrder(orderId: string, owner: DeliveryOwner) {
    const order = await this.loadOrder(this.prisma, orderId);
    if (
      !order ||
      (order.userId
        ? order.userId !== owner.userId
        : !owner.guestSessionId ||
          order.guestSessionId !== owner.guestSessionId)
    )
      throw new NotFoundException('Order not found');
    return order;
  }

  async getState(orderId: string, owner?: DeliveryOwner) {
    const order = owner
      ? await this.getOwnedOrder(orderId, owner)
      : await this.loadOrder(this.prisma, orderId);
    if (!order) throw new NotFoundException('Order not found');
    return this.buildState(order);
  }

  async confirmDestination(
    orderId: string,
    dto: UpdateOrderDestinationDto,
    owner: DeliveryOwner,
  ) {
    const existing = await this.getOwnedOrder(orderId, owner);
    this.assertEditable(existing);
    this.assertNoActivePayment(existing);
    const previous = this.destination(existing.deliveryDestination);
    const normalizedBase = {
      country: this.required(dto.country),
      region: this.optional(dto.region),
      city: this.required(dto.city),
      street: this.optional(dto.street),
      building: this.optional(dto.building),
      apartment: this.optional(dto.apartment),
      postalCode: this.optional(dto.postalCode),
      fullAddress: this.required(dto.fullAddress),
      latitude: dto.latitude,
      longitude: dto.longitude,
      externalLocationId: this.optional(dto.externalLocationId),
      recipientName: this.required(dto.recipientName),
      recipientPhone: `+${normalizeRussianPhone(dto.recipientPhone)}`,
      recipientEmail: this.optional(dto.recipientEmail),
    };
    const comparablePrevious = previous
      ? { ...previous, version: undefined }
      : undefined;
    const changed =
      JSON.stringify(comparablePrevious) !==
      JSON.stringify({ ...normalizedBase, version: undefined });
    if (changed) {
      await this.prisma.$transaction(
        async (tx) => {
          const current = await this.loadOrder(tx, orderId);
          if (!current) throw new NotFoundException('Order not found');
          this.assertNoActivePayment(current);
          const currentDestination = this.destination(
            current.deliveryDestination,
          );
          await tx.orderDeliverySelection.deleteMany({ where: { orderId } });
          await tx.deliveryQuote.updateMany({
            where: { orderId, status: { in: ['CREATED', 'SELECTED'] } },
            data: { status: 'CANCELLED', quoteKey: null },
          });
          await tx.order.update({
            where: { id: orderId },
            data: {
              deliveryDestination: {
                ...normalizedBase,
                version: (currentDestination?.version ?? 0) + 1,
              } as Prisma.InputJsonValue,
              deliveryAddress: normalizedBase.fullAddress,
              deliveryVersion: { increment: 1 },
              pricingVersion: { increment: 1 },
            },
          });
          await this.reprice(tx, orderId);
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    }
    return this.getState(orderId, owner);
  }

  async replaceSelections(
    orderId: string,
    dto: UpdateOrderDeliverySelectionsDto,
    owner: DeliveryOwner,
  ) {
    const groupKeys = dto.selections.map((selection) => selection.groupKey);
    if (new Set(groupKeys).size !== groupKeys.length)
      throw new BadRequestException('Duplicate delivery group');
    await this.prisma.$transaction(
      async (tx) => {
        const order = await this.loadOrder(tx, orderId);
        if (
          !order ||
          (order.userId
            ? order.userId !== owner.userId
            : !owner.guestSessionId ||
              order.guestSessionId !== owner.guestSessionId)
        )
          throw new NotFoundException('Order not found');
        this.assertEditable(order);
        this.assertNoActivePayment(order);
        if (
          dto.pricingVersion != null &&
          dto.pricingVersion !== order.pricingVersion
        )
          throw new ConflictException('Delivery pricing version is stale');
        const destination = this.destination(order.deliveryDestination);
        if (!destination)
          throw new DeliveryProviderError(
            'DESTINATION_REQUIRED',
            'Сначала подтвердите адрес доставки.',
          );
        const resolution = this.resolve(order);
        const groupByKey = new Map(
          resolution.groups.map((group) => [group.groupKey, group]),
        );
        const quoteIds = dto.selections.map((selection) => selection.quoteId);
        const quotes = await tx.deliveryQuote.findMany({
          where: { id: { in: quoteIds } },
          include: {
            deliveryProvider: true,
            deliveryService: true,
            originWarehouse: { include: { providerConfigs: true } },
          },
        });
        const quoteById = new Map(quotes.map((quote) => [quote.id, quote]));
        const now = new Date();
        const nextVersion = order.pricingVersion + 1;
        for (const requested of dto.selections) {
          const group = groupByKey.get(requested.groupKey);
          const quote = quoteById.get(requested.quoteId);
          if (!group)
            throw new BadRequestException(
              `Unknown delivery group: ${requested.groupKey}`,
            );
          if (
            !quote ||
            quote.orderId !== orderId ||
            quote.groupKey !== requested.groupKey
          )
            throw new BadRequestException(
              'Delivery quote does not belong to this order group',
            );
          if (
            quote.expiresAt <= now ||
            !['CREATED', 'SELECTED'].includes(quote.status)
          )
            throw new ConflictException('Delivery quote has expired');
          if (
            quote.destinationVersion !== destination.version ||
            quote.orderDeliveryVersion !== order.deliveryVersion
          )
            throw new ConflictException('Delivery quote is stale');
          if (
            !quote.deliveryProvider.isActive ||
            !quote.deliveryService.isActive
          )
            throw new ConflictException('Delivery service is no longer active');
          const expectedFingerprint = this.buildFingerprint(
            order,
            group,
            quote.deliveryProviderId,
          );
          if (expectedFingerprint !== quote.fingerprint)
            throw new ConflictException(
              'Delivery quote configuration has changed',
            );
        }
        await tx.orderDeliverySelection.deleteMany({ where: { orderId } });
        for (const requested of dto.selections) {
          const quote = quoteById.get(requested.quoteId)!;
          await tx.orderDeliverySelection.create({
            data: {
              orderId,
              groupKey: requested.groupKey,
              deliveryQuoteId: quote.id,
              customerCharge: quote.customerCharge,
              currency: quote.currency,
              quoteFingerprint: quote.fingerprint,
              destinationVersion: quote.destinationVersion,
              orderDeliveryVersion: quote.orderDeliveryVersion,
            },
          });
          await tx.deliveryQuote.update({
            where: { id: quote.id },
            data: { status: 'SELECTED', selectedAt: new Date() },
          });
        }
        await tx.deliveryQuote.updateMany({
          where: {
            orderId,
            status: 'SELECTED',
            id: { notIn: quoteIds.length ? quoteIds : ['__none__'] },
          },
          data: { status: 'CREATED', selectedAt: null },
        });
        await tx.order.update({
          where: { id: orderId },
          data: { pricingVersion: nextVersion },
        });
        await this.reprice(tx, orderId);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
    return this.getState(orderId, owner);
  }

  async assertReadyForPayment(orderId: string, owner: DeliveryOwner) {
    const order = await this.getOwnedOrder(orderId, owner);
    const state = await this.buildState(order);
    if (!state.readyForPayment)
      throw new BadRequestException(
        state.blockingReasons[0] ?? 'Выберите доставку перед оплатой.',
      );
    const expected = state.pricing.totalAmount;
    if (order.totalAmount !== expected)
      throw new ConflictException('Order total is stale');
    return { order, state };
  }

  async preparePayment(orderId: string, owner: DeliveryOwner) {
    return this.prisma.$transaction(
      async (tx) => {
        const order = await this.loadOrder(tx, orderId);
        if (
          !order ||
          (order.userId
            ? order.userId !== owner.userId
            : !owner.guestSessionId ||
              order.guestSessionId !== owner.guestSessionId)
        )
          throw new NotFoundException('Order not found');
        this.assertEditable(order);
        const state = await this.buildState(order);
        if (!state.readyForPayment)
          throw new BadRequestException(
            state.blockingReasons[0] ?? 'Выберите доставку перед оплатой.',
          );
        if (order.totalAmount !== state.pricing.totalAmount)
          throw new ConflictException('Order total is stale');

        const existing = order.paymentAttempts.find(
          (attempt: any) => attempt.activeOrderId === order.id,
        );
        if (existing) {
          if (existing.amount !== order.totalAmount)
            throw new ConflictException(
              'Сумма заказа изменилась после начала оплаты.',
            );
          return existing;
        }
        return tx.paymentAttempt.create({
          data: {
            orderId: order.id,
            activeOrderId: order.id,
            idempotenceKey: randomUUID(),
            amount: order.totalAmount,
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  buildFingerprint(
    order: any,
    group: ResolvedDeliveryGroup,
    providerId: string,
  ) {
    const destination = this.destination(order.deliveryDestination)!;
    const warehouse = group.items[0].warehouse!;
    const sourceItem = order.items.find(
      (item: any) => item.id === group.items[0].id,
    );
    const fullWarehouse = sourceItem.product.warehouses.find(
      (mapping: any) => mapping.warehouseId === warehouse.id,
    ).warehouse;
    const provider = sourceItem.product.deliveryServices
      .map((mapping: any) => mapping.deliveryService.provider)
      .find((value: any) => value.id === providerId);
    const providerConfig = fullWarehouse.providerConfigs.find(
      (config: any) => config.deliveryProviderId === providerId,
    );
    const serviceCodes = group.commonServiceIds
      .map((id) => {
        for (const item of order.items) {
          const mapping = item.product.deliveryServices.find(
            (value: any) => value.deliveryServiceId === id,
          );
          if (mapping) return mapping.deliveryService.code;
        }
        return id;
      })
      .filter((code) =>
        group.items.every((item) => {
          const record = order.items.find((value: any) => value.id === item.id);
          return record.product.deliveryServices.some(
            (mapping: any) =>
              mapping.deliveryService.code === code &&
              mapping.deliveryService.providerId === providerId,
          );
        }),
      )
      .sort();
    return createDeliveryFingerprint({
      version: 2,
      orderId: order.id,
      groupKey: group.groupKey,
      providerCode: provider?.code,
      fixedMarkup: provider?.fixedMarkup,
      providerActive: provider?.isActive,
      serviceCodes,
      destination,
      destinationVersion: destination.version,
      orderDeliveryVersion: order.deliveryVersion,
      origin: {
        id: fullWarehouse.id,
        address: {
          country: fullWarehouse.country,
          region: fullWarehouse.region,
          city: fullWarehouse.city,
          street: fullWarehouse.street,
          building: fullWarehouse.building,
          fullAddress: fullWarehouse.fullAddress,
          postalCode: fullWarehouse.postalCode,
          latitude: this.number(fullWarehouse.latitude),
          longitude: this.number(fullWarehouse.longitude),
        },
        providerConfig: {
          enabled: providerConfig?.isEnabled,
          externalLocationId: providerConfig?.externalLocationId,
        },
      },
      packages: this.packages(order, group),
    });
  }

  resolve(order: any) {
    return this.resolver.resolve(
      order.id,
      order.deliveryVersion,
      order.items.map((item: any) => {
        const primary = item.product.warehouses.find(
          (mapping: any) => mapping.isPrimary && mapping.isActive,
        );
        const warehouse = primary?.warehouse;
        const enabledMappings = item.product.deliveryServices.filter(
          (mapping: any) => mapping.isEnabled,
        );
        const activeMappings = enabledMappings.filter(
          (mapping: any) =>
            mapping.deliveryService.isActive &&
            mapping.deliveryService.provider.isActive,
        );
        const configuredMappings = activeMappings.filter((mapping: any) =>
          warehouse?.providerConfigs.some(
            (config: any) =>
              config.deliveryProviderId ===
                mapping.deliveryService.providerId && config.isEnabled,
          ),
        );
        const packages = item.product.shippingProfile?.packages ?? [];
        const validPackages =
          packages.length > 0 &&
          packages.every((profile: any) =>
            [
              profile.quantity,
              profile.weightGrams,
              profile.lengthMillimeters,
              profile.widthMillimeters,
              profile.heightMillimeters,
            ].every((value) => Number.isSafeInteger(value) && value > 0),
          );
        return {
          id: item.id,
          title: item.productTitle ?? item.product.title,
          quantity: item.quantity,
          isOversized: item.isOversized,
          warehouse: warehouse
            ? {
                id: warehouse.id,
                name: warehouse.name,
                isActive: warehouse.isActive,
                isConfigured: warehouse.isConfigured,
              }
            : undefined,
          hasShippingProfile: Boolean(item.product.shippingProfile),
          hasValidPackages: validPackages,
          serviceIds: configuredMappings
            .map((mapping: any) => mapping.deliveryServiceId)
            .sort(),
          serviceIssue: enabledMappings.some(
            (mapping: any) => !mapping.deliveryService.provider.isActive,
          )
            ? ('PROVIDER_DISABLED' as const)
            : activeMappings.length && !configuredMappings.length
              ? ('WAREHOUSE_PROVIDER_CONFIG_MISSING' as const)
              : undefined,
        };
      }),
    );
  }

  private async buildState(order: any) {
    const resolution = this.resolve(order);
    const destination = this.destination(order.deliveryDestination);
    const now = new Date();
    const selections = new Map(
      order.deliverySelections.map((selection: any) => [
        selection.groupKey,
        selection,
      ]),
    );
    const groups = resolution.groups.map((group) => {
      const selected: any = selections.get(group.groupKey);
      let currentSelected: any;
      if (
        selected &&
        selected.deliveryQuote.expiresAt > now &&
        selected.destinationVersion === destination?.version &&
        selected.orderDeliveryVersion === order.deliveryVersion &&
        selected.deliveryQuote.deliveryProvider.isActive &&
        selected.deliveryQuote.deliveryService.isActive
      ) {
        try {
          if (
            this.buildFingerprint(
              order,
              group,
              selected.deliveryQuote.deliveryProviderId,
            ) === selected.quoteFingerprint
          )
            currentSelected = selected;
        } catch {
          currentSelected = undefined;
        }
      }
      const quotes = order.deliveryQuotes.filter(
        (quote: any) =>
          quote.groupKey === group.groupKey &&
          quote.expiresAt > now &&
          ['CREATED', 'SELECTED'].includes(quote.status),
      );
      const providers = new Map<string, any>();
      for (const quote of quotes) {
        const provider = providers.get(quote.deliveryProviderId) ?? {
          code: quote.deliveryProvider.code,
          name: quote.deliveryProvider.name,
          options: [],
        };
        const normalized =
          (quote.providerPayload as any)?.normalizedOption ?? {};
        if (normalized.fulfillmentType !== 'PICKUP')
          provider.options.push(this.publicOption(quote, normalized));
        providers.set(quote.deliveryProviderId, provider);
      }
      return {
        groupKey: group.groupKey,
        warehouse: group.warehouse,
        items: group.items.map((item) => ({
          orderItemId: item.id,
          title: item.title,
          quantity: item.quantity,
        })),
        providers: [...providers.values()],
        selectedQuote: currentSelected
          ? this.publicOption(
              currentSelected.deliveryQuote,
              (currentSelected.deliveryQuote.providerPayload as any)
                ?.normalizedOption ?? {},
            )
          : null,
        readiness: {
          status: quotes.length
            ? currentSelected
              ? 'SELECTED'
              : 'SELECTION_REQUIRED'
            : 'QUOTE_REQUIRED',
        },
      };
    });
    const calculatedPricing = calculateOrderPricing(
      order.items,
      groups.flatMap((group) =>
        group.selectedQuote ? [group.selectedQuote.customerPrice] : [],
      ),
    );
    const oversizedReady = order.items
      .filter((item: any) => item.isOversized)
      .every(
        (item: any) =>
          item.deliveryQuote &&
          item.deliveryQuote.status === 'ACCEPTED' &&
          item.deliveryQuote.confirmedDeliveryPrice === item.deliveryPrice &&
          (!item.deliveryQuote.expiresAt || item.deliveryQuote.expiresAt > now),
      );
    const allSelected = groups.every((group) => group.selectedQuote);
    const readyForPayment =
      order.items.length > 0 &&
      Boolean(destination || groups.length === 0) &&
      !resolution.unavailableItems.length &&
      allSelected &&
      oversizedReady;
    const blockingReasons = [
      ...(!destination && groups.length ? ['Подтвердите адрес доставки.'] : []),
      ...(resolution.unavailableItems.length
        ? ['Для части товаров доставка недоступна.']
        : []),
      ...(!allSelected
        ? ['Выберите способ доставки для каждого отправления.']
        : []),
      ...(!oversizedReady
        ? ['Для крупногабаритных товаров требуется принятый расчёт доставки.']
        : []),
      ...(!order.items.length ? ['В заказе нет товаров.'] : []),
    ];
    return {
      status: readyForPayment
        ? 'READY_FOR_PAYMENT'
        : resolution.unavailableItems.length
          ? 'BLOCKED'
          : !destination && groups.length
            ? 'ADDRESS_REQUIRED'
            : groups.some((group) => !group.providers.length)
              ? 'READY_FOR_QUOTE'
              : 'SELECTION_REQUIRED',
      destination: destination ?? null,
      groups,
      unavailableItems: resolution.unavailableItems,
      pricing: {
        ...calculatedPricing,
        currency: 'RUB',
        version: order.pricingVersion,
      },
      readyForPayment,
      blockingReasons,
    };
  }

  private publicOption(quote: any, normalized: any) {
    return {
      quoteId: quote.id,
      serviceCode: normalized.serviceCode ?? quote.deliveryService.code,
      title: normalized.title ?? quote.deliveryService.name,
      description: normalized.description,
      fulfillmentType: normalized.fulfillmentType ?? 'DOOR',
      customerPrice: quote.customerCharge,
      currency: quote.currency,
      pickupInterval: normalized.pickupInterval,
      deliveryInterval: normalized.deliveryInterval,
      expiresAt: quote.expiresAt.toISOString(),
    };
  }

  private packages(order: any, group: ResolvedDeliveryGroup) {
    return group.items.flatMap((groupItem) => {
      const item = order.items.find((value: any) => value.id === groupItem.id);
      return item.product.shippingProfile.packages.map((profile: any) => ({
        orderItemId: item.id,
        productId: item.productId,
        sku: item.product.sku,
        quantity: item.quantity * profile.quantity,
        packageSequence: profile.sequence,
        type: profile.type,
        weightGrams: profile.weightGrams,
        lengthMillimeters: profile.lengthMillimeters,
        widthMillimeters: profile.widthMillimeters,
        heightMillimeters: profile.heightMillimeters,
      }));
    });
  }

  private async reprice(tx: any, orderId: string) {
    const [items, selections] = await Promise.all([
      tx.orderItem.findMany({ where: { orderId } }),
      tx.orderDeliverySelection.findMany({ where: { orderId } }),
    ]);
    const totalAmount = calculateOrderPricing(
      items,
      selections.map((selection: any) => selection.customerCharge),
    ).totalAmount;
    await tx.order.update({ where: { id: orderId }, data: { totalAmount } });
  }

  private loadOrder(client: any, orderId: string) {
    return client.order.findUnique({
      where: { id: orderId },
      include: {
        paymentAttempts: true,
        deliverySelections: {
          include: {
            deliveryQuote: {
              include: { deliveryProvider: true, deliveryService: true },
            },
          },
        },
        deliveryQuotes: {
          include: { deliveryProvider: true, deliveryService: true },
        },
        items: {
          include: {
            deliveryQuote: true,
            product: {
              include: {
                shippingProfile: {
                  include: { packages: { orderBy: { sequence: 'asc' } } },
                },
                warehouses: {
                  include: {
                    warehouse: { include: { providerConfigs: true } },
                  },
                },
                deliveryServices: {
                  include: { deliveryService: { include: { provider: true } } },
                },
              },
            },
          },
        },
      },
    });
  }

  private destination(value: unknown): OrderDeliveryDestination | undefined {
    return value && typeof value === 'object' && !Array.isArray(value)
      ? (value as OrderDeliveryDestination)
      : undefined;
  }
  private assertEditable(order: any) {
    if (order.status !== OrderStatus.AWAITING_PAYMENT)
      throw new BadRequestException('Order is not editable');
  }
  private assertNoActivePayment(order: any) {
    if (
      order.paymentAttempts.some((attempt: any) =>
        ACTIVE_PAYMENT_STATUSES.includes(attempt.status),
      )
    )
      throw new ConflictException(
        'Нельзя изменить доставку после начала оплаты.',
      );
  }
  private required(value: string) {
    const result = value.trim();
    if (!result)
      throw new BadRequestException('Required delivery field is empty');
    return result;
  }
  private optional(value?: string) {
    return value?.trim() || undefined;
  }
  private number(value: any) {
    return value?.toNumber?.() ?? (value == null ? undefined : Number(value));
  }
}
