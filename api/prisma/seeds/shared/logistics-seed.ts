import {
  DeliveryServiceKind,
  PrismaClient,
  WarehouseType,
} from '@prisma/client';

const YANDEX_SERVICES = [
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

  const yandex = await prisma.deliveryProvider.upsert({
    where: { code: 'YANDEX' },
    create: { code: 'YANDEX', name: 'Яндекс Доставка', isActive: true, fixedMarkup: 0 },
    update: { name: 'Яндекс Доставка' },
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
      update: { name: service.name, kind: service.kind },
    });
  }
}
