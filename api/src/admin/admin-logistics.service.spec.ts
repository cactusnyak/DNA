import { AdminInputService } from './admin-input.service';
import { AdminLogisticsService } from './admin-logistics.service';

describe('AdminLogisticsService', () => {
  const prisma: any = {
    warehouse: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    deliveryProvider: { findMany: jest.fn() },
    warehouseProviderConfig: { deleteMany: jest.fn(), create: jest.fn() },
    auditEvent: { create: jest.fn() },
  };
  const input = new AdminInputService(prisma);
  const service = new AdminLogisticsService(prisma, input);

  beforeEach(() => jest.clearAllMocks());

  it('derives isConfigured and ignores a client-supplied flag', async () => {
    prisma.warehouse.findFirst.mockResolvedValue(null);
    prisma.warehouse.create.mockImplementation(({ data }: any) =>
      Promise.resolve({ id: 'warehouse-1', ...data }),
    );
    prisma.warehouse.findMany.mockResolvedValue([
      {
        id: 'warehouse-1',
        code: 'personal',
        name: 'Личный склад',
        isConfigured: false,
        latitude: null,
        longitude: null,
        providerConfigs: [],
        products: [],
        _count: { products: 0, deliveryQuotes: 0, shipments: 0 },
      },
    ]);

    await service.createWarehouse({
      code: 'personal',
      name: 'Личный склад',
      isConfigured: true,
    });

    expect(prisma.warehouse.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ isConfigured: false }),
      }),
    );
  });

  it('deactivates a warehouse with historical dependencies', async () => {
    prisma.warehouse.findUnique.mockResolvedValue({
      id: 'warehouse-1',
      _count: {
        products: 0,
        providerConfigs: 0,
        deliveryQuotes: 1,
        shipments: 0,
      },
    });

    await expect(service.deleteWarehouse('warehouse-1')).resolves.toEqual({
      archived: true,
    });
    expect(prisma.warehouse.update).toHaveBeenCalledWith({
      where: { id: 'warehouse-1' },
      data: { isActive: false },
    });
    expect(prisma.warehouse.delete).not.toHaveBeenCalled();
  });
});
