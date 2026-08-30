import {
  DeliveryServiceKind,
  PrismaClient,
  WarehouseType,
} from '@prisma/client';

export const YANDEX_DELIVERY_PROVIDER_CODE = 'YANDEX';
export const CDEK_DELIVERY_PROVIDER_CODE = 'CDEK';

export const CDEK_SERVICES = [
  {
    code: 'CDEK_COURIER',
    name: 'СДЭК — доставка до двери',
    kind: DeliveryServiceKind.DOOR,
    isActive: true,
  },
  {
    code: 'CDEK_PICKUP',
    name: 'СДЭК — пункт выдачи',
    kind: DeliveryServiceKind.PICKUP,
    isActive: false,
  },
] as const;

export const YANDEX_SERVICES = [
  {
    code: 'YANDEX_EXPRESS',
    name: 'Яндекс Экспресс',
    kind: DeliveryServiceKind.EXPRESS,
  },
  {
    code: 'YANDEX_CARGO',
    name: 'Яндекс Грузовой',
    kind: DeliveryServiceKind.CARGO,
  },
  {
    code: 'YANDEX_RUSSIA_DOOR',
    name: 'Яндекс Доставка по России — до двери',
    kind: DeliveryServiceKind.DOOR,
  },
  {
    code: 'YANDEX_RUSSIA_PICKUP',
    name: 'Яндекс Доставка по России — пункт выдачи',
    kind: DeliveryServiceKind.PICKUP,
  },
] as const;

type LogisticsSeedClient = Pick<
  PrismaClient,
  'warehouse' | 'deliveryProvider' | 'deliveryService'
>;

type DeliveryReferenceSeedClient = Pick<
  PrismaClient,
  'deliveryProvider' | 'deliveryService'
>;

export async function ensureYandexDeliveryReferenceData(
  prisma: DeliveryReferenceSeedClient,
  options: { forceActive?: boolean } = {},
) {
  const yandex = await prisma.deliveryProvider.upsert({
    where: { code: YANDEX_DELIVERY_PROVIDER_CODE },
    create: {
      code: YANDEX_DELIVERY_PROVIDER_CODE,
      name: 'Яндекс Доставка',
      isActive: true,
      fixedMarkup: 0,
    },
    update: {
      name: 'Яндекс Доставка',
      ...(options.forceActive ? { isActive: true } : {}),
    },
  });

  for (const service of YANDEX_SERVICES) {
    await prisma.deliveryService.upsert({
      where: {
        providerId_code: { providerId: yandex.id, code: service.code },
      },
      create: {
        providerId: yandex.id,
        code: service.code,
        name: service.name,
        kind: service.kind,
        isActive: true,
      },
      update: {
        name: service.name,
        kind: service.kind,
        ...(options.forceActive ? { isActive: true } : {}),
      },
    });
  }

  return yandex;
}

export async function ensureCdekDeliveryReferenceData(
  prisma: DeliveryReferenceSeedClient,
  options: { forceActive?: boolean } = {},
) {
  const cdek = await prisma.deliveryProvider.upsert({
    where: { code: CDEK_DELIVERY_PROVIDER_CODE },
    create: {
      code: CDEK_DELIVERY_PROVIDER_CODE,
      name: 'СДЭК',
      isActive: true,
      fixedMarkup: 0,
    },
    update: {
      name: 'СДЭК',
      ...(options.forceActive ? { isActive: true } : {}),
    },
  });
  for (const service of CDEK_SERVICES) {
    await prisma.deliveryService.upsert({
      where: { providerId_code: { providerId: cdek.id, code: service.code } },
      create: { providerId: cdek.id, ...service },
      update: {
        name: service.name,
        kind: service.kind,
        isActive: service.isActive,
      },
    });
  }
  return cdek;
}

/**
 * Creates provider-neutral logistics reference data only. Product mappings,
 * warehouse provider configuration and fictional address data are deliberately
 * not seeded.
 */
export async function seedLogisticsFoundation(
  prisma: LogisticsSeedClient,
): Promise<void> {
  await prisma.warehouse.upsert({
    where: { code: 'personal' },
    create: {
      code: 'personal',
      name: 'Личный склад',
      type: WarehouseType.OWN,
      isActive: true,
      isConfigured: false,
    },
    // Do not reset real address/configuration entered after the initial seed.
    update: { name: 'Личный склад', type: WarehouseType.OWN },
  });

  await ensureYandexDeliveryReferenceData(prisma);
  await ensureCdekDeliveryReferenceData(prisma);
}
