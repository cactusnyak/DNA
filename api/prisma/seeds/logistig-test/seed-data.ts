import { PackageType, Prisma, WarehouseType } from '@prisma/client';

export const LOGISTICS_UI_CATEGORY = {
  name: 'Logistics UI Test',
  slug: 'logistics-ui-test',
  sortOrder: 9_900,
  description: 'Development-only products for manual logistics UI testing.',
} as const;
export const LOGISTICS_UI_MARKUP = 100;
export const LOGISTICS_UI_IMAGE_URL =
  '/uploads/images/logistics-ui-test-placeholder.jpg';

const ORIGIN_A = {
  country: 'Россия',
  region: 'Московская область',
  city: 'Подольск',
  street: 'Логистическая улица',
  building: '1',
  postalCode: '142100',
  fullAddress: 'Россия, Московская область, Подольск, Логистическая улица, 1',
  latitude: '55.431245',
  longitude: '37.545764',
  contactName: 'Иван Складской',
  contactPhone: '+7 999 000-00-01',
  contactEmail: 'logistics-ui@example.com',
  timezone: 'Europe/Moscow',
  workingHours: {
    monday: '09:00-18:00',
    tuesday: '09:00-18:00',
    wednesday: '09:00-18:00',
    thursday: '09:00-18:00',
    friday: '09:00-18:00',
    saturday: '10:00-16:00',
    sunday: null,
  },
  courierInstructions:
    'Заезд через центральные ворота, перед прибытием позвонить.',
  loadingAvailable: true,
} as const;

export const LOGISTICS_UI_WAREHOUSES = [
  {
    code: 'logistics-ui-origin-a',
    name: 'Logistics UI — Origin A',
    externalLocationId: 'mock-logistics-origin-a',
    ...ORIGIN_A,
  },
  {
    code: 'logistics-ui-origin-b',
    name: 'Logistics UI — Origin B',
    externalLocationId: 'mock-logistics-origin-b',
    country: 'Россия',
    region: 'Московская область',
    city: 'Химки',
    street: 'Транспортный проезд',
    building: '7',
    postalCode: '141400',
    fullAddress: 'Россия, Московская область, Химки, Транспортный проезд, 7',
    latitude: '55.897042',
    longitude: '37.429691',
    contactName: 'Мария Логистова',
    contactPhone: '+7 999 000-00-02',
    contactEmail: 'logistics-ui-b@example.com',
    timezone: 'Europe/Moscow',
    workingHours: {
      monday: '08:00-20:00',
      tuesday: '08:00-20:00',
      wednesday: '08:00-20:00',
      thursday: '08:00-20:00',
      friday: '08:00-20:00',
      saturday: '09:00-17:00',
      sunday: '09:00-17:00',
    },
    courierInstructions: 'Погрузка со стороны Транспортного проезда.',
    loadingAvailable: true,
  },
  {
    code: 'logistics-ui-origin-a-clone',
    name: 'Logistics UI — Origin A Clone',
    externalLocationId: 'mock-logistics-origin-a',
    ...ORIGIN_A,
  },
] as const;

export type LogisticsServiceCode =
  | 'YANDEX_EXPRESS'
  | 'YANDEX_CARGO'
  | 'YANDEX_RUSSIA_DOOR'
  | 'YANDEX_RUSSIA_PICKUP';
type LogisticsUiProduct = {
  slug: string;
  sku: string;
  title: string;
  price: number;
  purchasePrice: number;
  warehouseCode: (typeof LOGISTICS_UI_WAREHOUSES)[number]['code'];
  serviceCodes: readonly LogisticsServiceCode[];
  isOversized: boolean;
  weightGrams: number;
  lengthMillimeters: number;
  widthMillimeters: number;
  heightMillimeters: number;
};

export const LOGISTICS_UI_PRODUCTS = [
  {
    slug: 'logistics-ui-service-ab',
    sku: 'LOGISTICS-UI-001',
    title: 'Логистика: Экспресс или Карго',
    price: 10_100,
    purchasePrice: 6_000,
    warehouseCode: 'logistics-ui-origin-a',
    serviceCodes: ['YANDEX_EXPRESS', 'YANDEX_CARGO'],
    isOversized: false,
    weightGrams: 2_100,
    lengthMillimeters: 400,
    widthMillimeters: 300,
    heightMillimeters: 200,
  },
  {
    slug: 'logistics-ui-service-b',
    sku: 'LOGISTICS-UI-002',
    title: 'Логистика: Только Карго',
    price: 12_200,
    purchasePrice: 7_000,
    warehouseCode: 'logistics-ui-origin-a',
    serviceCodes: ['YANDEX_CARGO'],
    isOversized: false,
    weightGrams: 3_200,
    lengthMillimeters: 500,
    widthMillimeters: 350,
    heightMillimeters: 250,
  },
  {
    slug: 'logistics-ui-service-c',
    sku: 'LOGISTICS-UI-003',
    title: 'Логистика: Только доставка по России',
    price: 14_300,
    purchasePrice: 8_000,
    warehouseCode: 'logistics-ui-origin-a',
    serviceCodes: ['YANDEX_RUSSIA_DOOR'],
    isOversized: false,
    weightGrams: 4_300,
    lengthMillimeters: 600,
    widthMillimeters: 400,
    heightMillimeters: 300,
  },
  {
    slug: 'logistics-ui-origin-b-cargo',
    sku: 'LOGISTICS-UI-004',
    title: 'Логистика: Карго с другого склада',
    price: 16_400,
    purchasePrice: 9_000,
    warehouseCode: 'logistics-ui-origin-b',
    serviceCodes: ['YANDEX_CARGO'],
    isOversized: false,
    weightGrams: 5_400,
    lengthMillimeters: 700,
    widthMillimeters: 450,
    heightMillimeters: 350,
  },
  {
    slug: 'logistics-ui-origin-clone-cargo',
    sku: 'LOGISTICS-UI-005',
    title: 'Логистика: Карго с логического склада-клона',
    price: 18_500,
    purchasePrice: 10_000,
    warehouseCode: 'logistics-ui-origin-a-clone',
    serviceCodes: ['YANDEX_CARGO'],
    isOversized: false,
    weightGrams: 6_500,
    lengthMillimeters: 800,
    widthMillimeters: 500,
    heightMillimeters: 400,
  },
  {
    slug: 'logistics-ui-oversized',
    sku: 'LOGISTICS-UI-006',
    title: 'Логистика: Крупногабаритный товар',
    price: 50_600,
    purchasePrice: 30_000,
    warehouseCode: 'logistics-ui-origin-a',
    serviceCodes: [],
    isOversized: true,
    weightGrams: 85_000,
    lengthMillimeters: 2_400,
    widthMillimeters: 1_200,
    heightMillimeters: 1_400,
  },
  {
    slug: 'logistics-ui-unavailable',
    sku: 'LOGISTICS-UI-007',
    title: 'Логистика: Нет доступной доставки',
    price: 20_700,
    purchasePrice: 11_000,
    warehouseCode: 'logistics-ui-origin-a',
    serviceCodes: [],
    isOversized: false,
    weightGrams: 7_600,
    lengthMillimeters: 900,
    widthMillimeters: 550,
    heightMillimeters: 450,
  },
] as const satisfies readonly LogisticsUiProduct[];

export function warehouseCreateData(
  definition: (typeof LOGISTICS_UI_WAREHOUSES)[number],
) {
  const { externalLocationId: _externalLocationId, ...warehouse } = definition;
  void _externalLocationId;
  return {
    ...warehouse,
    type: WarehouseType.OWN,
    latitude: new Prisma.Decimal(definition.latitude),
    longitude: new Prisma.Decimal(definition.longitude),
    workingHours: definition.workingHours satisfies Prisma.InputJsonValue,
    isActive: true,
    isConfigured: true,
  };
}

export function productCreateData(
  definition: (typeof LOGISTICS_UI_PRODUCTS)[number],
  categoryId: string,
) {
  const warehouse = LOGISTICS_UI_WAREHOUSES.find(
    ({ code }) => code === definition.warehouseCode,
  )!;
  return {
    categoryId,
    title: definition.title,
    slug: definition.slug,
    description: {
      blocks: [
        { type: 'heading', text: definition.title },
        {
          type: 'paragraph',
          text: 'Детерминированный товар для ручной проверки логистики.',
        },
      ],
    } satisfies Prisma.InputJsonValue,
    price: definition.price,
    sku: definition.sku,
    purchasePrice: definition.purchasePrice,
    additions: Prisma.JsonNull,
    location: {
      name: warehouse.city,
      coordinates: {
        latitude: Number(warehouse.latitude),
        longitude: Number(warehouse.longitude),
      },
    } satisfies Prisma.InputJsonValue,
    isOversizedOverride: definition.isOversized,
    isActive: true,
    deletedAt: null,
  };
}

export function packageCreateData(
  definition: (typeof LOGISTICS_UI_PRODUCTS)[number],
) {
  return {
    sequence: 0,
    name: definition.isOversized
      ? 'Крупногабаритное место'
      : 'Основная коробка',
    type: definition.isOversized ? PackageType.OTHER : PackageType.BOX,
    quantity: 1,
    weightGrams: definition.weightGrams,
    lengthMillimeters: definition.lengthMillimeters,
    widthMillimeters: definition.widthMillimeters,
    heightMillimeters: definition.heightMillimeters,
  };
}
