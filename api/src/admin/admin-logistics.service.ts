import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DeliveryQuoteStatus,
  Prisma,
  ShipmentStatus,
  WarehouseType,
} from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { AdminInputService } from './admin-input.service';
import { OrderDeliveryInvalidationService } from '../delivery-providers/order-delivery-invalidation.service';
import { RewardsService } from '../rewards/rewards.service';

const WAREHOUSE_REQUIRED_FIELDS = [
  'country',
  'city',
  'street',
  'building',
  'fullAddress',
  'contactName',
  'contactPhone',
  'timezone',
] as const;

type WarehouseAdminRow = Prisma.WarehouseGetPayload<{
  include: {
    providerConfigs: { include: { deliveryProvider: true } };
    _count: {
      select: { products: true; deliveryQuotes: true; shipments: true };
    };
    products: { select: { productId: true } };
  };
}>;

@Injectable()
export class AdminLogisticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly input: AdminInputService,
    private readonly deliveryInvalidation?: OrderDeliveryInvalidationService,
    private readonly rewardsService?: RewardsService,
  ) {}

  async getConfiguration() {
    const [warehouses, providers] = await Promise.all([
      this.listWarehouses(),
      this.listProviders(),
    ]);
    return { warehouses, providers };
  }

  listWarehouses() {
    return this.prisma.warehouse
      .findMany({
        include: {
          providerConfigs: { include: { deliveryProvider: true } },
          _count: {
            select: {
              products: true,
              deliveryQuotes: true,
              shipments: true,
            },
          },
          products: { where: { isPrimary: true }, select: { productId: true } },
        },
        orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
      })
      .then((items) => items.map((item) => this.mapWarehouse(item)));
  }

  async createWarehouse(body: unknown) {
    const data = await this.parseWarehouse(body);
    const warehouse = await this.prisma.warehouse.create({ data });
    await this.replaceWarehouseProviderConfigs(warehouse.id, body);
    await this.audit('LOGISTICS_WAREHOUSE_CREATED', 'Warehouse', warehouse.id);
    return this.getWarehouse(warehouse.id);
  }

  async updateWarehouse(id: string, body: unknown) {
    await this.getWarehouseOrThrow(id);
    const data = await this.parseWarehouse(body, id);
    await this.prisma.$transaction(async (tx) => {
      await tx.warehouse.update({ where: { id }, data });
      await this.replaceWarehouseProviderConfigs(id, body, tx);
    });
    await this.audit('LOGISTICS_WAREHOUSE_UPDATED', 'Warehouse', id);
    await this.deliveryInvalidation?.invalidateAffected({ warehouseId: id });
    return this.getWarehouse(id);
  }

  async deleteWarehouse(id: string) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
            providerConfigs: true,
            deliveryQuotes: true,
            shipments: true,
          },
        },
      },
    });
    if (!warehouse) throw new NotFoundException('Warehouse not found');
    const used = Object.values(warehouse._count).some((count) => count > 0);
    if (used) {
      await this.prisma.warehouse.update({
        where: { id },
        data: { isActive: false },
      });
      await this.audit('LOGISTICS_WAREHOUSE_ARCHIVED', 'Warehouse', id);
      await this.deliveryInvalidation?.invalidateAffected({ warehouseId: id });
      return { archived: true };
    }
    await this.prisma.warehouse.delete({ where: { id } });
    await this.audit('LOGISTICS_WAREHOUSE_DELETED', 'Warehouse', id);
    return { deleted: true };
  }

  listProviders() {
    return this.prisma.deliveryProvider.findMany({
      include: {
        services: {
          include: { _count: { select: { products: true } } },
          orderBy: { name: 'asc' },
        },
        _count: { select: { warehouseConfigs: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async updateProvider(id: string, body: unknown) {
    const payload = this.input.getObjectBody(body);
    const previous = await this.assertProviderExists(id);
    const result = await this.prisma.deliveryProvider.update({
      where: { id },
      data: {
        name: this.input.getRequiredString(
          payload.name,
          'Provider name is required',
        ),
        isActive: this.input.getBoolean(payload.isActive, true),
        fixedMarkup: Math.max(
          0,
          Math.trunc(this.input.getNumber(payload.fixedMarkup, 0)),
        ),
      },
    });
    await this.audit('LOGISTICS_PROVIDER_UPDATED', 'DeliveryProvider', id);
    if (
      previous.isActive !== result.isActive ||
      previous.fixedMarkup !== result.fixedMarkup
    )
      await this.deliveryInvalidation?.invalidateAffected({ providerId: id });
    return result;
  }

  async updateService(id: string, body: unknown) {
    const payload = this.input.getObjectBody(body);
    const service = await this.prisma.deliveryService.findUnique({
      where: { id },
    });
    if (!service) throw new NotFoundException('Delivery service not found');
    const result = await this.prisma.deliveryService.update({
      where: { id },
      data: {
        name: this.input.getRequiredString(
          payload.name,
          'Service name is required',
        ),
        isActive: this.input.getBoolean(payload.isActive, true),
      },
    });
    await this.audit('LOGISTICS_SERVICE_UPDATED', 'DeliveryService', id);
    if (service.isActive !== result.isActive)
      await this.deliveryInvalidation?.invalidateAffected({ serviceId: id });
    return result;
  }

  async listQuotes(query: Record<string, string | undefined>) {
    const { page, limit, skip } = this.pagination(query);
    const where: Prisma.DeliveryQuoteWhereInput = {
      status: this.enumValue(DeliveryQuoteStatus, query.status),
      deliveryProviderId: this.input.getOptionalString(query.providerId),
      deliveryServiceId: this.input.getOptionalString(query.serviceId),
    };
    const search = this.input.getOptionalString(query.search);
    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { providerQuoteId: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await this.prisma.$transaction([
      this.prisma.deliveryQuote.findMany({
        where,
        skip,
        take: limit,
        include: {
          deliveryProvider: true,
          deliveryService: true,
          originWarehouse: true,
        },
        orderBy: { createdAt: query.sort === 'asc' ? 'asc' : 'desc' },
      }),
      this.prisma.deliveryQuote.count({ where }),
    ]);
    return {
      items: items.map((item) => ({
        ...item,
        userId: undefined,
        guestSessionId: undefined,
        ownerType: item.userId ? 'USER' : 'GUEST',
        ownerLabel: item.userId ? `user:${item.userId.slice(0, 8)}` : 'guest',
        destinationSnapshot: undefined,
        cargoSnapshot: undefined,
        originSnapshot: undefined,
        providerPayload: undefined,
        destinationSummary: this.destinationSummary(item.destinationSnapshot),
      })),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getQuote(id: string) {
    const item = await this.prisma.deliveryQuote.findUnique({
      where: { id },
      include: {
        deliveryProvider: true,
        deliveryService: true,
        originWarehouse: true,
      },
    });
    if (!item) throw new NotFoundException('Delivery quote not found');
    const safe = { ...item, providerPayload: undefined };
    return safe;
  }

  async listShipments(query: Record<string, string | undefined>) {
    const { page, limit, skip } = this.pagination(query);
    const where: Prisma.ShipmentWhereInput = {
      status: this.enumValue(ShipmentStatus, query.status),
      deliveryProviderId: this.input.getOptionalString(query.providerId),
      deliveryServiceId: this.input.getOptionalString(query.serviceId),
      originWarehouseId: this.input.getOptionalString(query.warehouseId),
    };
    const search = this.input.getOptionalString(query.search);
    if (search) {
      where.OR = ['id', 'orderId', 'providerOrderId', 'trackingId'].map(
        (field) => ({
          [field]: { contains: search, mode: 'insensitive' },
        }),
      );
    }
    const [items, total] = await this.prisma.$transaction([
      this.prisma.shipment.findMany({
        where,
        skip,
        take: limit,
        include: {
          deliveryProvider: true,
          deliveryService: true,
          originWarehouse: true,
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: query.sort === 'asc' ? 'asc' : 'desc' },
      }),
      this.prisma.shipment.count({ where }),
    ]);
    return {
      items: items.map((item) => ({
        ...item,
        originSnapshot: undefined,
        destinationSnapshot: undefined,
        cargoSnapshot: undefined,
        serviceSnapshot: undefined,
        providerMetadata: undefined,
        destinationSummary: this.destinationSummary(item.destinationSnapshot),
        itemsCount: item._count.items,
        _count: undefined,
      })),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getShipment(id: string) {
    const item = await this.prisma.shipment.findUnique({
      where: { id },
      include: {
        deliveryProvider: true,
        deliveryService: true,
        originWarehouse: true,
        order: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
            createdAt: true,
          },
        },
        items: {
          include: {
            orderItem: {
              select: { id: true, productTitle: true, quantity: true },
            },
          },
        },
        statusEvents: {
          include: { actor: { select: { id: true, nickname: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!item) throw new NotFoundException('Shipment not found');
    const safe = { ...item, providerMetadata: undefined };
    return safe;
  }

  async updateShipmentStatus(id: string, body: unknown, actorUserId?: string) {
    const payload = this.input.getObjectBody(body);
    const nextStatus = this.enumValue(ShipmentStatus, payload.status);
    if (!nextStatus) throw new BadRequestException('Invalid shipment status');
    const shipment = await this.prisma.shipment.findUnique({ where: { id } });
    if (!shipment) throw new NotFoundException('Shipment not found');
    const terminal = new Set<ShipmentStatus>([
      ShipmentStatus.DELIVERED,
      ShipmentStatus.CANCELLED,
      ShipmentStatus.RETURNED,
    ]);
    if (terminal.has(shipment.status) && shipment.status !== nextStatus) {
      throw new BadRequestException(
        'Terminal shipment status cannot be changed directly',
      );
    }
    await this.prisma.$transaction(async (tx) => {
      await tx.shipment.update({
        where: { id },
        data: {
          status: nextStatus,
          deliveredAt:
            nextStatus === ShipmentStatus.DELIVERED ? new Date() : undefined,
          cancelledAt:
            nextStatus === ShipmentStatus.CANCELLED ? new Date() : undefined,
        },
      });
      await tx.shipmentStatusEvent.create({
        data: {
          shipmentId: id,
          previousStatus: shipment.status,
          status: nextStatus,
          source: 'ADMIN',
          actorUserId,
        },
      });
    });
    const active = await this.prisma.shipment.findMany({
      where: {
        orderId: shipment.orderId,
        status: { not: ShipmentStatus.CANCELLED },
      },
      select: { status: true },
    });
    if (
      active.length > 0 &&
      active.every((item) => item.status === ShipmentStatus.DELIVERED)
    ) {
      const order = await this.prisma.order.findUniqueOrThrow({
        where: { id: shipment.orderId },
      });
      if (order.status === 'PAID' || order.status === 'SHIPPED') {
        await this.rewardsService?.releaseOrderRewards(order.id, true);
      }
    }
    return this.getShipment(id);
  }

  private async parseWarehouse(body: unknown, id?: string) {
    const payload = this.input.getObjectBody(body);
    const code = this.input.getRequiredString(
      payload.code,
      'Warehouse code is required',
    );
    const duplicate = await this.prisma.warehouse.findFirst({
      where: { code, id: id ? { not: id } : undefined },
    });
    if (duplicate) throw new ConflictException('Warehouse code already exists');
    const type =
      this.enumValue(WarehouseType, payload.type) ?? WarehouseType.OWN;
    const strings = Object.fromEntries(
      [
        'country',
        'region',
        'city',
        'street',
        'building',
        'postalCode',
        'fullAddress',
        'contactName',
        'contactPhone',
        'contactEmail',
        'timezone',
        'courierInstructions',
      ].map((key) => [key, this.input.getOptionalString(payload[key])]),
    );
    const latitude = this.optionalCoordinate(
      payload.latitude,
      -90,
      90,
      'latitude',
    );
    const longitude = this.optionalCoordinate(
      payload.longitude,
      -180,
      180,
      'longitude',
    );
    const candidate = { ...strings, latitude, longitude };
    const isConfigured =
      WAREHOUSE_REQUIRED_FIELDS.every((key) => Boolean(candidate[key])) &&
      latitude != null &&
      longitude != null;
    return {
      code,
      name: this.input.getRequiredString(
        payload.name,
        'Warehouse name is required',
      ),
      type,
      ...strings,
      latitude,
      longitude,
      workingHours: payload.workingHours
        ? (payload.workingHours as Prisma.InputJsonValue)
        : Prisma.JsonNull,
      loadingAvailable: this.input.getBoolean(payload.loadingAvailable, false),
      isActive: this.input.getBoolean(payload.isActive, true),
      isConfigured,
    };
  }

  private async replaceWarehouseProviderConfigs(
    warehouseId: string,
    body: unknown,
    tx: Prisma.TransactionClient | PrismaService = this.prisma,
  ) {
    const payload = this.input.getObjectBody(body);
    if (!Array.isArray(payload.providerConfigs)) return;
    const configs = payload.providerConfigs.map((value) =>
      this.input.getObjectBody(value),
    );
    const providerIds = configs.map((item) =>
      this.input.getRequiredString(
        item.deliveryProviderId,
        'Provider is required',
      ),
    );
    if (new Set(providerIds).size !== providerIds.length)
      throw new BadRequestException('Provider config must be unique');
    const providers = await tx.deliveryProvider.findMany({
      where: { id: { in: providerIds } },
    });
    if (providers.length !== providerIds.length)
      throw new BadRequestException('Unknown provider');
    for (const [index, config] of configs.entries()) {
      const deliveryProviderId = providerIds[index];
      const mutableData = {
        externalLocationId: this.input.getOptionalString(
          config.externalLocationId,
        ),
        isEnabled: this.input.getBoolean(config.isEnabled, false),
      };
      await tx.warehouseProviderConfig.upsert({
        where: {
          warehouseId_deliveryProviderId: {
            warehouseId,
            deliveryProviderId,
          },
        },
        create: { warehouseId, deliveryProviderId, ...mutableData },
        // metadata is intentionally absent: admin edits must preserve the
        // provider-private value already stored on the configuration.
        update: mutableData,
      });
    }
  }

  private async getWarehouse(id: string) {
    const items = await this.prisma.warehouse.findMany({
      where: { id },
      include: {
        providerConfigs: { include: { deliveryProvider: true } },
        _count: {
          select: { products: true, deliveryQuotes: true, shipments: true },
        },
        products: { where: { isPrimary: true }, select: { productId: true } },
      },
    });
    if (!items[0]) throw new NotFoundException('Warehouse not found');
    return this.mapWarehouse(items[0]);
  }

  private getWarehouseOrThrow(id: string) {
    return this.prisma.warehouse
      .findUniqueOrThrow({ where: { id } })
      .catch(() => {
        throw new NotFoundException('Warehouse not found');
      });
  }

  private mapWarehouse(item: WarehouseAdminRow) {
    const missingConfigurationFields: string[] =
      WAREHOUSE_REQUIRED_FIELDS.filter((key) => !item[key]);
    if (item.latitude == null) missingConfigurationFields.push('latitude');
    if (item.longitude == null) missingConfigurationFields.push('longitude');
    return {
      ...item,
      latitude: item.latitude?.toNumber?.() ?? null,
      longitude: item.longitude?.toNumber?.() ?? null,
      productsCount: item._count.products,
      primaryProductsCount: item.products.length,
      providerConfigsEnabledCount: item.providerConfigs.filter(
        (config) => config.isEnabled,
      ).length,
      missingConfigurationFields,
      _count: undefined,
      products: undefined,
    };
  }

  private pagination(query: Record<string, string | undefined>) {
    const page = Math.max(1, Math.trunc(this.input.getNumber(query.page, 1)));
    const limit = Math.min(
      100,
      Math.max(1, Math.trunc(this.input.getNumber(query.limit, 25))),
    );
    return { page, limit, skip: (page - 1) * limit };
  }

  private enumValue<T extends Record<string, string>>(
    values: T,
    value: unknown,
  ): T[keyof T] | undefined {
    return typeof value === 'string' && Object.values(values).includes(value)
      ? (value as T[keyof T])
      : undefined;
  }

  private optionalCoordinate(
    value: unknown,
    min: number,
    max: number,
    label: string,
  ) {
    if (value == null || value === '') return undefined;
    const number = this.input.getNumber(value, Number.NaN);
    if (!Number.isFinite(number) || number < min || number > max)
      throw new BadRequestException(`Invalid ${label}`);
    return number;
  }

  private destinationSummary(snapshot: unknown) {
    if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot))
      return '—';
    const address = (snapshot as Record<string, unknown>).address;
    if (!address || typeof address !== 'object' || Array.isArray(address))
      return '—';
    const data = address as Record<string, unknown>;
    return (
      [data.city, data.region, data.country]
        .filter((value): value is string => typeof value === 'string')
        .join(', ') || '—'
    );
  }

  private async assertProviderExists(id: string) {
    const provider = await this.prisma.deliveryProvider.findUnique({
      where: { id },
      select: { id: true, isActive: true, fixedMarkup: true },
    });
    if (!provider) throw new NotFoundException('Delivery provider not found');
    return provider;
  }

  private audit(action: string, targetType: string, targetId: string) {
    return this.prisma.auditEvent.create({
      data: { action, targetType, targetId },
    });
  }
}
