import { DeliveryServiceKind, WarehouseType } from '@prisma/client';

import {
  ensureYandexDeliveryReferenceData,
  seedLogisticsFoundation,
  YANDEX_SERVICES,
} from '../../prisma/seeds/shared/logistics-seed';

describe('seedLogisticsFoundation', () => {
  it('is repeatable and never creates product/service mappings', async () => {
    const warehouseUpsert = jest.fn().mockResolvedValue({ id: 'warehouse' });
    const providerUpsert = jest.fn().mockResolvedValue({ id: 'yandex' });
    const serviceUpsert = jest.fn().mockResolvedValue({});
    const prisma = {
      warehouse: { upsert: warehouseUpsert },
      deliveryProvider: { upsert: providerUpsert },
      deliveryService: { upsert: serviceUpsert },
    };

    await seedLogisticsFoundation(prisma as never);
    await seedLogisticsFoundation(prisma as never);

    expect(Object.keys(prisma)).toEqual([
      'warehouse',
      'deliveryProvider',
      'deliveryService',
    ]);
    expect(warehouseUpsert).toHaveBeenCalledTimes(2);
    expect(warehouseUpsert).toHaveBeenNthCalledWith(1, {
      where: { code: 'personal' },
      create: {
        code: 'personal',
        name: 'Личный склад',
        type: WarehouseType.OWN,
        isActive: true,
        isConfigured: false,
      },
      update: { name: 'Личный склад', type: WarehouseType.OWN },
    });
    expect(providerUpsert).toHaveBeenCalledTimes(2);
    expect(serviceUpsert).toHaveBeenCalledTimes(8);
    expect(serviceUpsert).toHaveBeenNthCalledWith(1, {
      where: {
        providerId_code: {
          providerId: 'yandex',
          code: 'YANDEX_EXPRESS',
        },
      },
      create: {
        providerId: 'yandex',
        code: 'YANDEX_EXPRESS',
        name: 'Яндекс Экспресс',
        kind: DeliveryServiceKind.EXPRESS,
        isActive: true,
      },
      update: {
        name: 'Яндекс Экспресс',
        kind: DeliveryServiceKind.EXPRESS,
      },
    });
  });

  it('force-activates exactly the four expected Yandex reference services', async () => {
    const providerUpsert = jest.fn().mockResolvedValue({ id: 'yandex' });
    const serviceUpsert = jest
      .fn()
      .mockImplementation(({ create }: any) => Promise.resolve(create));
    const prisma = {
      deliveryProvider: { upsert: providerUpsert },
      deliveryService: { upsert: serviceUpsert },
    };

    await ensureYandexDeliveryReferenceData(prisma as never, {
      forceActive: true,
    });
    await ensureYandexDeliveryReferenceData(prisma as never, {
      forceActive: true,
    });

    expect(providerUpsert).toHaveBeenCalledTimes(2);
    expect(providerUpsert.mock.calls[0][0].update).toEqual({
      name: 'Яндекс Доставка',
      isActive: true,
    });
    expect(serviceUpsert).toHaveBeenCalledTimes(8);
    expect(
      serviceUpsert.mock.calls
        .slice(0, 4)
        .map(([argument]) => argument.create.code),
    ).toEqual(YANDEX_SERVICES.map((service) => service.code));
    expect(
      serviceUpsert.mock.calls.every(
        ([argument]) => argument.update.isActive === true,
      ),
    ).toBe(true);
  });
});
