import 'dotenv/config';

import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

import {
  ensureYandexDeliveryReferenceData,
  YANDEX_DELIVERY_PROVIDER_CODE,
  YANDEX_SERVICES,
} from '../shared/logistics-seed.js';
import {
  LOGISTICS_UI_CATEGORY,
  LOGISTICS_UI_IMAGE_URL,
  LOGISTICS_UI_MARKUP,
  LOGISTICS_UI_PRODUCTS,
  LOGISTICS_UI_WAREHOUSES,
  packageCreateData,
  productCreateData,
  warehouseCreateData,
} from './seed-data.js';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is not defined');
const databaseUrl = new URL(connectionString);
const pool = new Pool({ connectionString });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

function environmentValue(name: string, fallback: string) {
  return process.env[name]?.trim() || fallback;
}

async function assertSafeLocalTarget() {
  const host = databaseUrl.hostname;
  const port = databaseUrl.port || '5432';
  const database = databaseUrl.pathname.replace(/^\//, '');
  const nodeEnvironment = environmentValue('NODE_ENV', 'development');
  const expressMode = environmentValue('YANDEX_EXPRESS_MODE', 'unset');
  const russiaMode = environmentValue('YANDEX_RUSSIA_MODE', 'unset');
  const liveMutations = environmentValue(
    'YANDEX_DELIVERY_LIVE_MUTATIONS_ENABLED',
    'false',
  );
  const [productCount, warehouseCount] = await Promise.all([
    prisma.product.count(),
    prisma.warehouse.count(),
  ]);
  const isLocal = ['localhost', '127.0.0.1', 'postgres'].includes(host);

  console.log('Logistig test seed destructive preflight:');
  console.log(`  database host: ${host}`);
  console.log(`  database port: ${port}`);
  console.log(`  database name: ${database}`);
  console.log(`  isLocal: ${isLocal}`);
  console.log(`  NODE_ENV: ${nodeEnvironment}`);
  console.log(`  Yandex modes: express=${expressMode}, russia=${russiaMode}`);
  console.log(`  live mutations enabled: ${liveMutations}`);
  console.log(`  current Product count: ${productCount}`);
  console.log(`  current Warehouse count: ${warehouseCount}`);

  const blockers = [
    !isLocal && `database host is not local (${host})`,
    port !== '5433' && `database port is not the expected local port (${port})`,
    database !== 'dna' &&
      `database name is not the local database (${database})`,
    ['production', 'staging'].includes(nodeEnvironment.toLowerCase()) &&
      `NODE_ENV is ${nodeEnvironment}`,
    expressMode !== 'mock' && `YANDEX_EXPRESS_MODE is ${expressMode}`,
    russiaMode !== 'mock' && `YANDEX_RUSSIA_MODE is ${russiaMode}`,
    liveMutations.toLowerCase() !== 'false' &&
      `YANDEX_DELIVERY_LIVE_MUTATIONS_ENABLED is ${liveMutations}`,
  ].filter(Boolean);
  if (blockers.length)
    throw new Error(`Unsafe destructive seed target: ${blockers.join('; ')}`);
}

async function ensurePlaceholderFile() {
  const source = resolve(
    'prisma/seeds/shared/assets/products/ab1cdde7-5af9-4e64-a0c0-831c6836adc4.jpg',
  );
  const destination = resolve(
    'uploads/images/logistics-ui-test-placeholder.jpg',
  );
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(source, destination);
}

async function seedLogistigTest() {
  console.warn(
    'WARNING: this development-only seed destructively replaces catalog and logistics data.',
  );
  await assertSafeLocalTarget();
  await ensurePlaceholderFile();

  await prisma.$transaction(async (transaction) => {
    await transaction.shipmentItem.deleteMany();
    await transaction.shipmentStatusEvent.deleteMany();
    await transaction.shipment.deleteMany();
    await transaction.orderDeliverySelection.deleteMany();
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
    await transaction.image.deleteMany({
      where: { url: LOGISTICS_UI_IMAGE_URL },
    });
    await transaction.warehouseProviderConfig.deleteMany();
    await transaction.warehouse.deleteMany();
    await transaction.deliveryService.deleteMany();
    await transaction.deliveryProvider.deleteMany();

    const yandex = await ensureYandexDeliveryReferenceData(transaction, {
      forceActive: true,
    });
    await transaction.deliveryProvider.update({
      where: { id: yandex.id },
      data: { fixedMarkup: LOGISTICS_UI_MARKUP },
    });
    const services = await transaction.deliveryService.findMany({
      where: { providerId: yandex.id },
    });
    const serviceByCode = new Map(
      services.map((service) => [service.code, service]),
    );
    const category = await transaction.marketCategory.create({
      data: {
        ...LOGISTICS_UI_CATEGORY,
        parentId: null,
        imageId: null,
        isActive: true,
        isOversized: false,
        deletedAt: null,
      },
    });
    const image = await transaction.image.create({
      data: {
        url: LOGISTICS_UI_IMAGE_URL,
        sortOrder: 0,
        alt: 'Logistics UI test product',
      },
    });

    const warehouseByCode = new Map<string, { id: string }>();
    for (const definition of LOGISTICS_UI_WAREHOUSES) {
      const warehouse = await transaction.warehouse.create({
        data: warehouseCreateData(definition),
      });
      warehouseByCode.set(definition.code, warehouse);
      await transaction.warehouseProviderConfig.create({
        data: {
          warehouseId: warehouse.id,
          deliveryProviderId: yandex.id,
          externalLocationId: definition.externalLocationId,
          isEnabled: true,
        },
      });
    }

    for (const definition of LOGISTICS_UI_PRODUCTS) {
      const warehouse = warehouseByCode.get(definition.warehouseCode);
      if (!warehouse)
        throw new Error(`Missing warehouse ${definition.warehouseCode}`);
      const product = await transaction.product.create({
        data: productCreateData(definition, category.id),
      });
      await transaction.productImage.create({
        data: { productId: product.id, imageId: image.id },
      });
      const shippingProfile = await transaction.productShippingProfile.create({
        data: {
          productId: product.id,
          isFragile: definition.slug === 'logistics-ui-service-ab',
          isStackable: !definition.isOversized,
          ageRestricted: false,
          handlingNotes: 'Development logistics UI fixture.',
        },
      });
      await transaction.productPackageProfile.create({
        data: {
          shippingProfileId: shippingProfile.id,
          ...packageCreateData(definition),
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
      if (definition.serviceCodes.length) {
        const serviceCodes: readonly string[] = definition.serviceCodes;
        await transaction.productDeliveryService.createMany({
          data: serviceCodes.map((code) => {
            const service = serviceByCode.get(code);
            if (!service) throw new Error(`Missing Yandex service ${code}`);
            return {
              productId: product.id,
              deliveryServiceId: service.id,
              isEnabled: true,
            };
          }),
        });
      }
    }
  });
  await validateSeed();
}

async function validateSeed() {
  const [providers, services, warehouses, configs, products] =
    await Promise.all([
      prisma.deliveryProvider.findMany(),
      prisma.deliveryService.findMany({ include: { provider: true } }),
      prisma.warehouse.findMany({ include: { providerConfigs: true } }),
      prisma.warehouseProviderConfig.findMany(),
      prisma.product.findMany({
        include: {
          shippingProfile: { include: { packages: true } },
          warehouses: { include: { warehouse: true } },
          deliveryServices: { include: { deliveryService: true } },
          images: { include: { image: true } },
        },
      }),
    ]);
  const fail = (message: string): never => {
    throw new Error(`Logistig test seed validation failed: ${message}`);
  };
  if (
    providers.length !== 1 ||
    providers[0].code !== YANDEX_DELIVERY_PROVIDER_CODE
  )
    fail('expected exactly one YANDEX provider');
  if (
    !providers[0].isActive ||
    providers[0].fixedMarkup !== LOGISTICS_UI_MARKUP
  )
    fail('YANDEX provider is inactive or has an unexpected markup');
  const expectedCodes = [...YANDEX_SERVICES.map(({ code }) => code)].sort();
  if (
    services.length !== 4 ||
    services.some(
      (service) => !service.isActive || service.provider.code !== 'YANDEX',
    ) ||
    services
      .map(({ code }) => code)
      .sort()
      .join(',') !== expectedCodes.join(',')
  )
    fail('expected exactly four active Yandex services');
  if (warehouses.length !== 3 || configs.length !== 3)
    fail('expected three warehouses and three provider configs');
  if (
    warehouses.some(
      (warehouse) =>
        !warehouse.isActive ||
        !warehouse.isConfigured ||
        warehouse.providerConfigs.length !== 1 ||
        !warehouse.providerConfigs[0].isEnabled,
    )
  )
    fail('warehouse configuration is incomplete');
  const byWarehouseCode = new Map(
    warehouses.map((warehouse) => [warehouse.code, warehouse]),
  );
  const originA = byWarehouseCode.get('logistics-ui-origin-a');
  const originB = byWarehouseCode.get('logistics-ui-origin-b');
  const clone = byWarehouseCode.get('logistics-ui-origin-a-clone');
  if (!originA || !originB || !clone)
    throw new Error(
      'Logistig test seed validation failed: warehouse identity matrix is incomplete',
    );
  if (originA.id === clone.id) fail('Origin A and its clone share an ID');
  const physical = (warehouse: NonNullable<typeof originA>) =>
    [warehouse.fullAddress, warehouse.latitude, warehouse.longitude].join('|');
  if (physical(originA) !== physical(clone))
    fail('Origin A clone is not physically identical');
  if (physical(originA) === physical(originB))
    fail('Origin B is not physically different');
  if (products.length !== 7) fail('expected seven products');
  const productBySlug = new Map(
    products.map((product) => [product.slug, product]),
  );
  for (const definition of LOGISTICS_UI_PRODUCTS) {
    const product = productBySlug.get(definition.slug);
    if (!product)
      throw new Error(
        `Logistig test seed validation failed: missing product ${definition.slug}`,
      );
    if (!product.isActive || product.deletedAt)
      fail(`inactive product ${definition.slug}`);
    if (product.isOversizedOverride !== definition.isOversized)
      fail(`oversized mismatch for ${definition.slug}`);
    const shippingProfile = product.shippingProfile;
    if (!shippingProfile || shippingProfile.packages.length !== 1)
      fail(`invalid package setup for ${definition.slug}`);
    if (!shippingProfile)
      throw new Error(
        `Logistig test seed validation failed: missing shipping profile for ${definition.slug}`,
      );
    const packageProfile = shippingProfile.packages[0];
    if (
      packageProfile.weightGrams <= 0 ||
      packageProfile.lengthMillimeters <= 0 ||
      packageProfile.widthMillimeters <= 0 ||
      packageProfile.heightMillimeters <= 0
    )
      fail(`non-positive package values for ${definition.slug}`);
    if (product.warehouses.length !== 1 || !product.warehouses[0].isPrimary)
      fail(`expected one primary warehouse for ${definition.slug}`);
    if (product.warehouses[0].warehouse.code !== definition.warehouseCode)
      fail(`warehouse mismatch for ${definition.slug}`);
    const actualServices = product.deliveryServices
      .filter((mapping) => mapping.isEnabled)
      .map((mapping) => mapping.deliveryService.code)
      .sort();
    if (
      actualServices.join(',') !== [...definition.serviceCodes].sort().join(',')
    )
      fail(`service mapping mismatch for ${definition.slug}`);
    if (actualServices.includes('YANDEX_RUSSIA_PICKUP'))
      fail(`unexpected pickup mapping for ${definition.slug}`);
    if (
      product.images.length !== 1 ||
      product.images[0].image.url !== LOGISTICS_UI_IMAGE_URL
    )
      fail(`placeholder image missing for ${definition.slug}`);
  }
  console.log('Logistig test seed completed and validated:');
  console.log(`  providers: ${providers.length}`);
  console.log(`  services: ${services.length}`);
  console.log(`  warehouses: ${warehouses.length}`);
  console.log(`  warehouse provider configs: ${configs.length}`);
  console.log(
    `  ordinary products: ${products.filter((product) => !product.isOversizedOverride).length}`,
  );
  console.log(
    `  oversized products: ${products.filter((product) => product.isOversizedOverride).length}`,
  );
  console.log(`  total products: ${products.length}`);
  console.log(
    `  fixed markup: ${providers[0].fixedMarkup} RUB per technical group`,
  );
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
