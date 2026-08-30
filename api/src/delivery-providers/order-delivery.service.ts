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
  UpdateOrderDeliveryPlanDto,
  UpdateOrderDeliverySelectionsDto,
  UpdateOrderDestinationDto,
} from './dto/order-delivery.dto';
import { createDeliveryFingerprint } from './utils/delivery-fingerprint';
import { normalizeRussianPhone } from './utils/logistics-units';
import { calculateOrderPricing } from './order-delivery-pricing';
import { OrderDeliveryInvalidationService } from './order-delivery-invalidation.service';
import {
  DeliveryPlanBuilder,
  type DeliveryPlanGroup,
} from './delivery-plan.builder';

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

const ORDER_DELIVERY_INCLUDE = {
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
            include: { packages: { orderBy: { sequence: 'asc' as const } } },
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
} satisfies Prisma.OrderInclude;

type OrderDeliveryRecord = Prisma.OrderGetPayload<{
  include: typeof ORDER_DELIVERY_INCLUDE;
}>;

type NormalizedQuoteOption = {
  serviceCode?: string;
  title?: string;
  fulfillmentType?: string;
  deliveryInterval?: { from: string; to: string };
};

@Injectable()
export class OrderDeliveryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly resolver: DeliveryGroupResolver,
    private readonly planBuilder: DeliveryPlanBuilder,
    private readonly invalidation: OrderDeliveryInvalidationService,
  ) {}

  async getOwnedOrder(orderId: string, owner: DeliveryOwner) {
    const order = await this.loadOrder(this.prisma, orderId);
    if (!order || !this.isOwnedBy(order, owner))
      throw new NotFoundException('Order not found');
    return order;
  }

  async getState(orderId: string, owner?: DeliveryOwner) {
    let order = owner
      ? await this.getOwnedOrder(orderId, owner)
      : await this.loadOrder(this.prisma, orderId);
    if (!order) throw new NotFoundException('Order not found');
    if (
      order.status === OrderStatus.AWAITING_PAYMENT &&
      this.hasStaleSelections(order)
    ) {
      await this.invalidation.invalidateOrder(orderId);
      order = owner
        ? await this.getOwnedOrder(orderId, owner)
        : await this.loadOrder(this.prisma, orderId);
      if (!order) throw new NotFoundException('Order not found');
    }
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
              },
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

  async selectPlan(
    orderId: string,
    dto: UpdateOrderDeliveryPlanDto,
    owner: DeliveryOwner,
  ) {
    await this.getState(orderId, owner);
    await this.prisma.$transaction(
      async (tx) => {
        const order = await this.loadOrder(tx, orderId);
        if (!order || !this.isOwnedBy(order, owner))
          throw new NotFoundException('Order not found');
        this.assertEditable(order);
        this.assertNoActivePayment(order);
        if (
          dto.pricingVersion != null &&
          dto.pricingVersion !== order.pricingVersion
        )
          throw new ConflictException('Delivery pricing version is stale');

        if (dto.planId === null) {
          if (order.deliverySelections.length === 0) return;

          await tx.orderDeliverySelection.deleteMany({ where: { orderId } });
          await tx.deliveryQuote.updateMany({
            where: { orderId, status: 'SELECTED' },
            data: { status: 'CREATED', selectedAt: null },
          });
          await tx.order.update({
            where: { id: orderId },
            data: { pricingVersion: { increment: 1 } },
          });
          await this.reprice(tx, orderId);
          return;
        }

        const destination = this.destination(order.deliveryDestination);
        if (!destination)
          throw new DeliveryProviderError(
            'DESTINATION_REQUIRED',
            'Сначала подтвердите адрес доставки.',
          );
        const resolution = this.resolve(order);
        const plans = this.buildPlans(order, resolution.groups, destination);
        const plan = plans.find((candidate) => candidate.planId === dto.planId);
        if (!plan)
          throw new ConflictException(
            'Вариант доставки устарел. Пересчитайте доставку.',
          );
        if (plan.selections.length !== resolution.groups.length)
          throw new ConflictException('Delivery plan does not cover the order');

        const quoteIds = plan.selections.map((selection) => selection.quoteId);
        const quotes = await tx.deliveryQuote.findMany({
          where: { id: { in: quoteIds } },
          include: { deliveryProvider: true, deliveryService: true },
        });
        const quoteById = new Map(quotes.map((quote) => [quote.id, quote]));
        const groupByKey = new Map(
          resolution.groups.map((group) => [group.groupKey, group]),
        );
        const now = new Date();
        for (const selection of plan.selections) {
          const group = groupByKey.get(selection.groupKey);
          const quote = quoteById.get(selection.quoteId);
          if (
            !group ||
            !quote ||
            quote.orderId !== orderId ||
            quote.groupKey !== selection.groupKey ||
            quote.expiresAt <= now ||
            !['CREATED', 'SELECTED'].includes(quote.status) ||
            quote.destinationVersion !== destination.version ||
            quote.orderDeliveryVersion !== order.deliveryVersion ||
            !quote.deliveryProvider.isActive ||
            !quote.deliveryService.isActive ||
            this.buildFingerprint(order, group, quote.deliveryProviderId) !==
              quote.fingerprint
          )
            throw new ConflictException(
              'Вариант доставки устарел. Пересчитайте доставку.',
            );
        }

        const currentBundle = order.deliverySelections
          .map((selection) => selection.deliveryQuoteId)
          .sort()
          .join(':');
        const nextBundle = [...quoteIds].sort().join(':');
        if (currentBundle === nextBundle) return;

        await tx.orderDeliverySelection.deleteMany({ where: { orderId } });
        await tx.orderDeliverySelection.createMany({
          data: plan.selections.map((selection) => {
            const quote = quoteById.get(selection.quoteId)!;
            return {
              orderId,
              groupKey: selection.groupKey,
              deliveryQuoteId: quote.id,
              customerCharge: quote.customerCharge,
              currency: quote.currency,
              quoteFingerprint: quote.fingerprint,
              destinationVersion: quote.destinationVersion,
              orderDeliveryVersion: quote.orderDeliveryVersion,
            };
          }),
        });
        await tx.deliveryQuote.updateMany({
          where: { orderId, status: 'SELECTED', id: { notIn: quoteIds } },
          data: { status: 'CREATED', selectedAt: null },
        });
        await tx.deliveryQuote.updateMany({
          where: { id: { in: quoteIds } },
          data: { status: 'SELECTED', selectedAt: now },
        });
        await tx.order.update({
          where: { id: orderId },
          data: { pricingVersion: { increment: 1 } },
        });
        await this.reprice(tx, orderId);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
    return this.getState(orderId, owner);
  }

  async assertReadyForPayment(orderId: string, owner: DeliveryOwner) {
    const order = await this.getOwnedOrder(orderId, owner);
    const state = this.buildState(order);
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
    // Explicit lazy reconciliation before entering the payment transaction:
    // expired/config-stale selections are removed and Order.totalAmount is
    // repriced before the payment guard evaluates readiness.
    await this.getState(orderId, owner);
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
        const state = this.buildState(order);
        if (!state.readyForPayment)
          throw new BadRequestException(
            state.blockingReasons[0] ?? 'Выберите доставку перед оплатой.',
          );
        if (order.totalAmount !== state.pricing.totalAmount)
          throw new ConflictException('Order total is stale');

        const existing = order.paymentAttempts.find(
          (attempt) => attempt.activeOrderId === order.id,
        );
        if (existing) {
          if (existing.amount !== order.externalPaymentAmount)
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
            amount: order.externalPaymentAmount,
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  buildFingerprint(
    order: OrderDeliveryRecord,
    group: ResolvedDeliveryGroup,
    providerId: string,
  ) {
    const destination = this.destination(order.deliveryDestination)!;
    const warehouse = group.items[0].warehouse!;
    const sourceItem = order.items.find(
      (item) => item.id === group.items[0].id,
    )!;
    const fullWarehouse = sourceItem.product.warehouses.find(
      (mapping) => mapping.warehouseId === warehouse.id,
    )!.warehouse;
    const provider = sourceItem.product.deliveryServices
      .map((mapping) => mapping.deliveryService.provider)
      .find((value) => value.id === providerId);
    const providerConfig = fullWarehouse.providerConfigs.find(
      (config) => config.deliveryProviderId === providerId,
    );
    const serviceCodes = group.commonServiceIds
      .map((id) => {
        for (const item of order.items) {
          const mapping = item.product.deliveryServices.find(
            (value) => value.deliveryServiceId === id,
          );
          if (mapping) return mapping.deliveryService.code;
        }
        return id;
      })
      .filter((code) =>
        group.items.every((item) => {
          const record = order.items.find((value) => value.id === item.id)!;
          return record.product.deliveryServices.some(
            (mapping) =>
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
        quoteContact: {
          name: fullWarehouse.contactName,
          phone: fullWarehouse.contactPhone,
        },
        providerConfig: {
          enabled: providerConfig?.isEnabled,
          externalLocationId: providerConfig?.externalLocationId,
        },
      },
      packages: this.packages(order, group),
    });
  }

  resolve(order: OrderDeliveryRecord) {
    return this.resolver.resolve(
      order.id,
      order.deliveryVersion,
      order.items.map((item) => {
        const primary = item.product.warehouses.find(
          (mapping) => mapping.isPrimary && mapping.isActive,
        );
        const warehouse = primary?.warehouse;
        const enabledMappings = item.product.deliveryServices.filter(
          (mapping) => mapping.isEnabled,
        );
        const activeMappings = enabledMappings.filter(
          (mapping) =>
            mapping.deliveryService.isActive &&
            mapping.deliveryService.provider.isActive,
        );
        const configuredMappings = activeMappings.filter((mapping) =>
          warehouse?.providerConfigs.some(
            (config) =>
              config.deliveryProviderId ===
                mapping.deliveryService.providerId && config.isEnabled,
          ),
        );
        const packages = item.product.shippingProfile?.packages ?? [];
        const validPackages =
          packages.length > 0 &&
          packages.every((profile) =>
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
            .map((mapping) => mapping.deliveryServiceId)
            .sort(),
          serviceIssue: enabledMappings.some(
            (mapping) => !mapping.deliveryService.provider.isActive,
          )
            ? ('PROVIDER_DISABLED' as const)
            : activeMappings.length && !configuredMappings.length
              ? ('WAREHOUSE_PROVIDER_CONFIG_MISSING' as const)
              : undefined,
        };
      }),
    );
  }

  private buildPlans(
    order: OrderDeliveryRecord,
    groups: ResolvedDeliveryGroup[],
    destination: OrderDeliveryDestination,
  ) {
    const now = new Date();
    const planGroups: DeliveryPlanGroup[] = groups.map((group) => ({
      groupKey: group.groupKey,
      items: group.items.map((item) => ({
        orderItemId: item.id,
        title: item.title,
        quantity: item.quantity,
      })),
      quotes: order.deliveryQuotes
        .filter(
          (quote) =>
            quote.groupKey === group.groupKey &&
            quote.expiresAt > now &&
            ['CREATED', 'SELECTED'].includes(quote.status) &&
            quote.destinationVersion === destination.version &&
            quote.orderDeliveryVersion === order.deliveryVersion &&
            quote.deliveryProvider.isActive &&
            quote.deliveryService.isActive &&
            this.isCurrentQuote(order, group, quote),
        )
        .map((quote) => {
          const normalized = this.normalizedQuoteOption(quote.providerPayload);
          return {
            quoteId: quote.id,
            provider: {
              code: quote.deliveryProvider.code,
              name: quote.deliveryProvider.name,
            },
            service: {
              code: normalized.serviceCode ?? quote.deliveryService.code,
              name: normalized.title ?? quote.deliveryService.name,
              fulfillmentType:
                normalized.fulfillmentType === 'PICKUP' ? 'PICKUP' : 'DOOR',
            },
            customerPrice: quote.customerCharge,
            currency: quote.currency,
            deliveryInterval: normalized.deliveryInterval,
            expiresAt: quote.expiresAt.toISOString(),
          };
        }),
    }));
    return this.planBuilder.build({
      groups: planGroups,
      destinationVersion: destination.version,
      deliveryVersion: order.deliveryVersion,
      pricingVersion: order.pricingVersion,
    });
  }

  private buildState(order: OrderDeliveryRecord) {
    const resolution = this.resolve(order);
    const destination = this.destination(order.deliveryDestination);
    const now = new Date();
    const plans = destination
      ? this.buildPlans(order, resolution.groups, destination)
      : [];
    const selectedQuoteIds = order.deliverySelections
      .filter((selection) =>
        this.isCurrentSelection(
          order,
          resolution.groups,
          destination,
          selection,
        ),
      )
      .map((selection) => selection.deliveryQuoteId)
      .sort();
    const selectedPlan = plans.find(
      (plan) =>
        plan.selections
          .map((selection) => selection.quoteId)
          .sort()
          .join(':') === selectedQuoteIds.join(':'),
    );
    const calculatedPricing = calculateOrderPricing(
      order.items,
      selectedPlan
        ? selectedPlan.selections.map(
            (selection) =>
              order.deliveryQuotes.find(
                (quote) => quote.id === selection.quoteId,
              )!.customerCharge,
          )
        : [],
    );
    const oversizedReady = order.items
      .filter((item) => item.isOversized)
      .every(
        (item) =>
          item.deliveryQuote &&
          item.deliveryQuote.status === 'ACCEPTED' &&
          item.deliveryQuote.confirmedDeliveryPrice === item.deliveryPrice &&
          (!item.deliveryQuote.expiresAt || item.deliveryQuote.expiresAt > now),
      );
    const allSelected = resolution.groups.length === 0 || Boolean(selectedPlan);
    const readyForPayment =
      order.items.length > 0 &&
      Boolean(destination || resolution.groups.length === 0) &&
      !resolution.unavailableItems.length &&
      allSelected &&
      oversizedReady;
    const blockingReasons = [
      ...(!destination && resolution.groups.length
        ? ['Подтвердите адрес доставки.']
        : []),
      ...(resolution.unavailableItems.length
        ? ['Для части товаров доставка недоступна.']
        : []),
      ...(!allSelected
        ? [
            plans.length
              ? 'Выберите вариант доставки заказа.'
              : 'Рассчитайте доставку заказа.',
          ]
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
          : !destination && resolution.groups.length
            ? 'ADDRESS_REQUIRED'
            : !plans.length
              ? 'READY_FOR_QUOTE'
              : 'SELECTION_REQUIRED',
      destination: destination ?? null,
      plans: plans.map((plan) => this.planBuilder.toPublic(plan)),
      selectedPlanId: selectedPlan?.planId ?? null,
      unavailableItems: resolution.unavailableItems.map((item) => ({
        ...item,
        retriable: false,
      })),
      pricing: {
        ...calculatedPricing,
        bonusDiscount: order.bonusDiscount,
        externalPaymentAmount: order.externalPaymentAmount,
        currency: 'RUB',
        version: order.pricingVersion,
      },
      readyForPayment,
      blockingReasons,
    };
  }

  private isCurrentQuote(
    order: OrderDeliveryRecord,
    group: ResolvedDeliveryGroup,
    quote: OrderDeliveryRecord['deliveryQuotes'][number],
  ) {
    try {
      return (
        this.buildFingerprint(order, group, quote.deliveryProviderId) ===
        quote.fingerprint
      );
    } catch {
      return false;
    }
  }

  private isCurrentSelection(
    order: OrderDeliveryRecord,
    groups: ResolvedDeliveryGroup[],
    destination: OrderDeliveryDestination | undefined,
    selection: OrderDeliveryRecord['deliverySelections'][number],
  ) {
    const group = groups.find((value) => value.groupKey === selection.groupKey);
    const quote = selection.deliveryQuote;
    return Boolean(
      destination &&
      group &&
      quote.expiresAt > new Date() &&
      selection.destinationVersion === destination.version &&
      selection.orderDeliveryVersion === order.deliveryVersion &&
      quote.deliveryProvider.isActive &&
      quote.deliveryService.isActive &&
      this.isCurrentQuote(order, group, quote),
    );
  }

  private hasStaleSelections(order: OrderDeliveryRecord) {
    if (!order.deliverySelections.length) return false;
    const groups = this.resolve(order).groups;
    const destination = this.destination(order.deliveryDestination);
    return (
      order.deliverySelections.length !== groups.length ||
      order.deliverySelections.some(
        (selection) =>
          !this.isCurrentSelection(order, groups, destination, selection),
      )
    );
  }

  private packages(order: OrderDeliveryRecord, group: ResolvedDeliveryGroup) {
    return group.items.flatMap((groupItem) => {
      const item = order.items.find((value) => value.id === groupItem.id)!;
      return item.product.shippingProfile!.packages.map((profile) => ({
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

  private async reprice(tx: Prisma.TransactionClient, orderId: string) {
    const [items, selections, order] = await Promise.all([
      tx.orderItem.findMany({ where: { orderId } }),
      tx.orderDeliverySelection.findMany({ where: { orderId } }),
      tx.order.findUnique?.({
        where: { id: orderId },
        select: { bonusDiscount: true },
      }) ?? Promise.resolve(null),
    ]);
    const totalAmount = calculateOrderPricing(
      items,
      selections.map((selection) => selection.customerCharge),
    ).totalAmount;
    await tx.order.update({
      where: { id: orderId },
      data: {
        totalAmount,
        externalPaymentAmount: totalAmount - (order?.bonusDiscount ?? 0),
      },
    });
  }

  private loadOrder(
    client: PrismaService | Prisma.TransactionClient,
    orderId: string,
  ): Promise<OrderDeliveryRecord | null> {
    return client.order.findUnique({
      where: { id: orderId },
      include: ORDER_DELIVERY_INCLUDE,
    });
  }

  private normalizedQuoteOption(
    value: Prisma.JsonValue,
  ): NormalizedQuoteOption {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    const option = value.normalizedOption;
    if (!option || typeof option !== 'object' || Array.isArray(option))
      return {};
    const interval = option.deliveryInterval;
    return {
      serviceCode:
        typeof option.serviceCode === 'string' ? option.serviceCode : undefined,
      title: typeof option.title === 'string' ? option.title : undefined,
      fulfillmentType:
        typeof option.fulfillmentType === 'string'
          ? option.fulfillmentType
          : undefined,
      deliveryInterval:
        interval &&
        typeof interval === 'object' &&
        !Array.isArray(interval) &&
        typeof interval.from === 'string' &&
        typeof interval.to === 'string'
          ? { from: interval.from, to: interval.to }
          : undefined,
    };
  }

  private destination(value: unknown): OrderDeliveryDestination | undefined {
    return value && typeof value === 'object' && !Array.isArray(value)
      ? (value as OrderDeliveryDestination)
      : undefined;
  }
  private assertEditable(order: OrderDeliveryRecord) {
    if (order.status !== OrderStatus.AWAITING_PAYMENT)
      throw new BadRequestException('Order is not editable');
  }
  private assertNoActivePayment(order: OrderDeliveryRecord) {
    if (
      order.paymentAttempts.some((attempt) =>
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
  private number(value: Prisma.Decimal | number | null | undefined) {
    return value == null ? undefined : Number(value);
  }

  private isOwnedBy(order: OrderDeliveryRecord, owner: DeliveryOwner) {
    return order.userId
      ? order.userId === owner.userId
      : Boolean(
          owner.guestSessionId && order.guestSessionId === owner.guestSessionId,
        );
  }
}
