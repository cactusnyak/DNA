import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import {
  PackageType,
  Prisma,
  PrismaClient,
  WarehouseType,
} from '@prisma/client';
import { Pool } from 'pg';

const CATEGORY_SLUG = 'logistig-test-category';
const PRODUCT_SKU = 'LOGISTIG-TEST-001';
const WAREHOUSE_CODE = 'logistig-test-warehouse';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const pool = new Pool({ connectionString });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function seedLogistigTest() {
  const result = await prisma.$transaction(async (transaction) => {
    await transaction.shipmentItem.deleteMany();
    await transaction.shipmentStatusEvent.deleteMany();
    await transaction.shipment.deleteMany();
    await transaction.deliveryQuote.deleteMany();
    await transaction.orderItem.deleteMany();
    await transaction.oversizedDeliveryQuote.deleteMany();
    await transaction.cartItem.deleteMany({
      where: { productId: { not: null } },
    });
    await transaction.favourite.deleteMany({
      where: { productId: { not: null } },
    });
    await transaction.productDeliveryService.deleteMany();
    await transaction.productWarehouse.deleteMany();
    await transaction.productPackageProfile.deleteMany();
    await transaction.productShippingProfile.deleteMany();
    await transaction.productImage.deleteMany();
    await transaction.catalogCollectionProduct.deleteMany();
    await transaction.product.deleteMany();
    await transaction.marketCategory.deleteMany();
    await transaction.warehouseProviderConfig.deleteMany();
    await transaction.warehouse.deleteMany();

    const categoryData = {
      name: 'Тест логистики',
      slug: CATEGORY_SLUG,
      sortOrder: 9_900,
      description: 'Тестовая категория для проверки логистики товара.',
      parentId: null,
      imageId: null,
      isActive: true,
      isOversized: false,
      deletedAt: null,
    };
    const category = await transaction.marketCategory.create({
      data: categoryData,
    });

    const warehouseData = {
      code: WAREHOUSE_CODE,
      name: 'Тестовый склад логистики',
      type: WarehouseType.OWN,
      country: 'Россия',
      region: 'Московская область',
      city: 'Подольск',
      street: 'Логистическая улица',
      building: '1',
      postalCode: '142100',
      fullAddress:
        'Россия, Московская область, Подольск, Логистическая улица, 1',
      latitude: new Prisma.Decimal('55.431245'),
      longitude: new Prisma.Decimal('37.545764'),
      contactName: 'Иван Складской',
      contactPhone: '+7 999 000-00-01',
      contactEmail: 'logistig-test@example.com',
      timezone: 'Europe/Moscow',
      workingHours: {
        monday: '09:00-18:00',
        tuesday: '09:00-18:00',
        wednesday: '09:00-18:00',
        thursday: '09:00-18:00',
        friday: '09:00-18:00',
        saturday: '10:00-16:00',
        sunday: null,
      } satisfies Prisma.InputJsonValue,
      courierInstructions:
        'Заезд через центральные ворота, перед прибытием позвонить.',
      loadingAvailable: true,
      isActive: true,
      isConfigured: true,
    };
    const warehouse = await transaction.warehouse.create({
      data: warehouseData,
    });

    const productData = {
      categoryId: category.id,
      title: 'Тестовый товар для логистики',
      slug: 'logistig-test-product',
      description: {
        blocks: [
          {
            type: 'heading',
            text: 'Тестовый товар',
          },
          {
            type: 'paragraph',
            text: 'Используется для проверки складов, упаковок и расчёта доставки.',
          },
        ],
      } satisfies Prisma.InputJsonValue,
      price: 25_000,
      sku: PRODUCT_SKU,
      purchasePrice: 15_000,
      additions: Prisma.JsonNull,
      location: {
        name: 'Подольск',
        coordinates: { latitude: 55.431245, longitude: 37.545764 },
      } satisfies Prisma.InputJsonValue,
      isOversizedOverride: false,
      isActive: true,
      deletedAt: null,
    };
    const product = await transaction.product.create({ data: productData });

    const shippingProfile = await transaction.productShippingProfile.create({
      data: {
        productId: product.id,
        isFragile: true,
        isStackable: false,
        ageRestricted: false,
        handlingNotes: 'Не кантовать. Беречь от влаги.',
      },
    });

    await transaction.productPackageProfile.create({
      data: {
        shippingProfileId: shippingProfile.id,
        sequence: 0,
        name: 'Основная коробка',
        type: PackageType.BOX,
        quantity: 1,
        weightGrams: 12_500,
        lengthMillimeters: 800,
        widthMillimeters: 600,
        heightMillimeters: 500,
      },
    });
    await transaction.productWarehouse.create({
      data: {
        productId: product.id,
        warehouseId: warehouse.id,
        isPrimary: true,
        isActive: true,
      },
    });

    const yandex = await transaction.deliveryProvider.findUnique({
      where: { code: 'YANDEX' },
      include: { services: true },
    });
    if (yandex) {
      await transaction.warehouseProviderConfig.create({
        data: {
          warehouseId: warehouse.id,
          deliveryProviderId: yandex.id,
          externalLocationId: 'mock-station',
          isEnabled: true,
        },
      });
      await transaction.productDeliveryService.createMany({
        data: yandex.services.map((service) => ({
          productId: product.id,
          deliveryServiceId: service.id,
          isEnabled: true,
        })),
      });
    }

    return { category, product, warehouse };
  });

  console.log('Logistig test seed completed:');
  console.log(`  category: ${result.category.name} (${result.category.id})`);
  console.log(`  product: ${result.product.title} (${result.product.id})`);
  console.log(`  warehouse: ${result.warehouse.name} (${result.warehouse.id})`);
}

seedLogistigTest()
  .catch((error: unknown) => {
    console.error('Logistig test seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
