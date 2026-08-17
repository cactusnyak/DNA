import { DeliveryServiceKind, WarehouseType } from '@prisma/client';

import { seedLogisticsFoundation } from '../../prisma/seeds/shared/logistics-seed';

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
});
