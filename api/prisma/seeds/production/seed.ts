import 'dotenv/config';

import { createHash } from 'node:crypto';
import { access, copyFile, mkdir, unlink } from 'node:fs/promises';
import { extname, join } from 'node:path';

import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

type SeedImage = {
  localPath: string;
  sortOrder: number;
};

type SeedProduct = {
  seedKey: string;
  title: string;
  description: {
    blocks: Array<{
      type: 'heading' | 'paragraph';
      text: string;
    }>;
  };
  price: number;
  kind: ProductKind;
  insulationSurcharge?: number;
  location?: {
    name: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  images: SeedImage[];
};

const PRODUCTION_PRODUCTS: SeedProduct[] = [
  {
    seedKey: 'product-001',
    title: 'Курятник до 15 кур',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '300 × 140 × 160 см.',
        },
        {
          type: 'heading',
          text: 'Материалы и конструкция',
        },
        {
          type: 'paragraph',
          text: 'Каркас: брус сухой строганный.',
        },
        {
          type: 'paragraph',
          text: 'Внутренняя отделка: ОСП 9 мм.',
        },
        {
          type: 'paragraph',
          text: 'Наружная отделка: имитация бруса 16 × 140 мм.',
        },
        {
          type: 'paragraph',
          text: 'Кровля: профнастил C8.',
        },
        {
          type: 'paragraph',
          text: 'Сетка: оцинкованная, ячейка 25 × 25 мм.',
        },
        {
          type: 'paragraph',
          text: 'Окно: 30 × 40 см.',
        },
        {
          type: 'heading',
          text: 'Комплектация и особенности',
        },
        {
          type: 'paragraph',
          text: 'Гнезда, насест, трап.',
        },
      ],
    },
    price: 50000,
    kind: 'chicken-coop',
    images: [
      {
        localPath: 'c9b460f1-7d4a-4b71-a126-ed124963cca4.jpg',
        sortOrder: 0,
      },
      {
        localPath: 'bdaffba5-66b2-4a6f-a042-24dd4eca393e.jpg',
        sortOrder: 1,
      },
      {
        localPath: 'a5dd2477-568f-4059-a09f-ae773adcd40c.jpg',
        sortOrder: 2,
      },
      {
        localPath: '02520013-f329-4f07-a8c8-75b7f44e497f.jpg',
        sortOrder: 3,
      },
      {
        localPath: '4777caaf-b993-4eba-a07a-374e0f636961.jpg',
        sortOrder: 4,
      },
      {
        localPath: 'd406b0de-de3e-4236-ac42-b2ddc9ba255a.jpg',
        sortOrder: 5,
      },
    ],
    insulationSurcharge: 5000,
    location: {
      name: 'Талдом',
      coordinates: {
        latitude: 56.7308,
        longitude: 37.5276,
      },
    },
  },
  {
    seedKey: 'product-002',
    title: 'Курятник до 10 кур',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '250 × 140 × 160 см.',
        },
        {
          type: 'heading',
          text: 'Материалы и конструкция',
        },
        {
          type: 'paragraph',
          text: 'Каркас: брус сухой строганный.',
        },
        {
          type: 'paragraph',
          text: 'Внутренняя отделка: ОСП 9 мм.',
        },
        {
          type: 'paragraph',
          text: 'Наружная отделка: имитация бруса 16 × 140 мм.',
        },
        {
          type: 'paragraph',
          text: 'Кровля: профнастил C8.',
        },
        {
          type: 'paragraph',
          text: 'Сетка: оцинкованная, ячейка 25 × 25 мм.',
        },
        {
          type: 'heading',
          text: 'Комплектация и особенности',
        },
        {
          type: 'paragraph',
          text: 'Гнезда, насест, трап.',
        },
      ],
    },
    price: 40000,
    kind: 'chicken-coop',
    images: [
      {
        localPath: 'b9edfd07-c7b2-4aa5-acbf-f7afe85159d0.jpg',
        sortOrder: 0,
      },
      {
        localPath: '4bb7f540-90ea-4422-ab9c-47938215835a.jpg',
        sortOrder: 1,
      },
    ],
    insulationSurcharge: 5000,
    location: {
      name: 'Талдом',
      coordinates: {
        latitude: 56.7308,
        longitude: 37.5276,
      },
    },
  },
  {
    seedKey: 'product-003',
    title: 'Курятник до 35 кур',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '500 × 140 × 160 см.',
        },
        {
          type: 'heading',
          text: 'Материалы и конструкция',
        },
        {
          type: 'paragraph',
          text: 'Каркас: брус сухой строганный.',
        },
        {
          type: 'paragraph',
          text: 'Внутренняя отделка: ОСП 9 мм.',
        },
        {
          type: 'paragraph',
          text: 'Наружная отделка: имитация бруса 16 × 140 мм.',
        },
        {
          type: 'paragraph',
          text: 'Кровля: профнастил C8.',
        },
        {
          type: 'paragraph',
          text: 'Сетка: оцинкованная, ячейка 25 × 25 мм.',
        },
        {
          type: 'heading',
          text: 'Комплектация и особенности',
        },
        {
          type: 'paragraph',
          text: 'Гнезда, насест, трап.',
        },
      ],
    },
    price: 98000,
    kind: 'chicken-coop',
    images: [
      {
        localPath: '1733e105-149d-41d8-ad27-3e2c80dd698e.jpg',
        sortOrder: 0,
      },
      {
        localPath: 'c65c5045-8d7c-480e-a797-acce92caa172.jpg',
        sortOrder: 1,
      },
      {
        localPath: '19be4e70-7d41-412a-a894-4ad47a6c4029.jpg',
        sortOrder: 2,
      },
    ],
    insulationSurcharge: 17000,
    location: {
      name: 'Талдом',
      coordinates: {
        latitude: 56.7308,
        longitude: 37.5276,
      },
    },
  },
  {
    seedKey: 'product-004',
    title: 'Курятник до 15 кур с покраской и полом',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '300 × 140 × 160 см.',
        },
        {
          type: 'heading',
          text: 'Материалы и конструкция',
        },
        {
          type: 'paragraph',
          text: 'Каркас: брус сухой строганный.',
        },
        {
          type: 'paragraph',
          text: 'Внутренняя отделка: ОСП 9 мм.',
        },
        {
          type: 'paragraph',
          text: 'Наружная отделка: имитация бруса 16 × 140 мм.',
        },
      ],
    },
    price: 75000,
    kind: 'chicken-coop',
    images: [
      {
        localPath: 'f417b305-e7f9-4d39-a7eb-07ea64ef0786.jpg',
        sortOrder: 0,
      },
    ],
    insulationSurcharge: 5000,
    location: {
      name: 'Талдом',
      coordinates: {
        latitude: 56.7308,
        longitude: 37.5276,
      },
    },
  },
  {
    seedKey: 'product-005',
    title: 'Курятник до 15 кур с покраской',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '300 × 140 × 160 см.',
        },
        {
          type: 'heading',
          text: 'Материалы и конструкция',
        },
        {
          type: 'paragraph',
          text: 'Каркас: брус сухой строганный.',
        },
        {
          type: 'paragraph',
          text: 'Внутренняя отделка: ОСП 9 мм.',
        },
        {
          type: 'paragraph',
          text: 'Наружная отделка: имитация бруса 16 × 140 мм.',
        },
      ],
    },
    price: 70000,
    kind: 'chicken-coop',
    images: [
      {
        localPath: '7289dc3b-1abd-41bc-ac1d-c6097beeebc0.jpg',
        sortOrder: 0,
      },
      {
        localPath: 'ff93b4d3-7b80-4322-a50d-ad0dd3e62263.jpg',
        sortOrder: 1,
      },
      {
        localPath: '92a01ffc-ce80-4a2c-a50a-daedccfc2a4f.jpg',
        sortOrder: 2,
      },
      {
        localPath: '00fd66a4-d081-4b6a-a4e3-2dcacd781e6c.jpg',
        sortOrder: 3,
      },
    ],
    insulationSurcharge: 5000,
    location: {
      name: 'Талдом',
      coordinates: {
        latitude: 56.7308,
        longitude: 37.5276,
      },
    },
  },
  {
    seedKey: 'product-006',
    title: 'Курятник до 15 кур с покраской',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '300 × 140 × 160 см.',
        },
        {
          type: 'heading',
          text: 'Материалы и конструкция',
        },
        {
          type: 'paragraph',
          text: 'Каркас: брус сухой строганный.',
        },
        {
          type: 'paragraph',
          text: 'Внутренняя отделка: ОСП 9 мм.',
        },
        {
          type: 'paragraph',
          text: 'Наружная отделка: имитация бруса 16 × 140 мм.',
        },
      ],
    },
    price: 70000,
    kind: 'chicken-coop',
    images: [
      {
        localPath: 'b6a41e8a-2423-4434-ae95-6858d1f22bfb.jpg',
        sortOrder: 0,
      },
      {
        localPath: 'ae8674cf-7515-4e53-ad87-3beb794ff6bc.jpg',
        sortOrder: 1,
      },
      {
        localPath: '314105ca-90ef-438b-a148-4c70df7cf0e8.jpg',
        sortOrder: 2,
      },
    ],
    insulationSurcharge: 5000,
    location: {
      name: 'Талдом',
      coordinates: {
        latitude: 56.7308,
        longitude: 37.5276,
      },
    },
  },
  {
    seedKey: 'product-007',
    title: 'Курятник до 7 кур',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '300 × 100 × 160 см.',
        },
        {
          type: 'heading',
          text: 'Материалы и конструкция',
        },
        {
          type: 'paragraph',
          text: 'Утеплитель: 50 мм.',
        },
      ],
    },
    price: 33000,
    kind: 'chicken-coop',
    images: [
      {
        localPath: 'dfe714e4-1fcb-4b29-aed0-2b8100cebcbb.jpg',
        sortOrder: 0,
      },
    ],
    insulationSurcharge: 5000,
    location: {
      name: 'Талдом',
      coordinates: {
        latitude: 56.7308,
        longitude: 37.5276,
      },
    },
  },
  {
    seedKey: 'product-008',
    title: 'Курятник до 7 кур',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '200 × 110 × 120 см.',
        },
      ],
    },
    price: 33000,
    kind: 'chicken-coop',
    images: [
      {
        localPath: '5eb89725-7941-455f-a666-9896e6447f6a.jpg',
        sortOrder: 0,
      },
    ],
    insulationSurcharge: 5000,
  },
  {
    seedKey: 'product-009',
    title: 'Курятник до 7 кур',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '300 × 100 × 120 см.',
        },
      ],
    },
    price: 38000,
    kind: 'chicken-coop',
    images: [
      {
        localPath: 'b2bae734-1938-4d22-a95e-340ce1e48ace.jpg',
        sortOrder: 0,
      },
    ],
    insulationSurcharge: 5000,
  },
  {
    seedKey: 'product-010',
    title: 'Курятник до 20 кур',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '300 × 140 × 180 см.',
        },
        {
          type: 'heading',
          text: 'Комплектация и особенности',
        },
        {
          type: 'paragraph',
          text: 'Поставляется в полной комплектации.',
        },
      ],
    },
    price: 70000,
    kind: 'chicken-coop',
    images: [
      {
        localPath: '1e48c9a3-a363-49fc-a236-746aac511f95.jpg',
        sortOrder: 0,
      },
      {
        localPath: '451997b1-0711-4e44-aff2-a570f834c8b4.jpg',
        sortOrder: 1,
      },
      {
        localPath: '271ee423-9b13-417a-afbb-2a5e63d96c9e.jpg',
        sortOrder: 2,
      },
      {
        localPath: '088e4827-564d-4951-a73c-1a0bcd06f349.jpg',
        sortOrder: 3,
      },
      {
        localPath: '85bbc7c7-b65b-4746-a0ed-452c2d9481b3.jpg',
        sortOrder: 4,
      },
    ],
    insulationSurcharge: 5000,
  },
  {
    seedKey: 'product-011',
    title: 'Крольчатник',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Описание',
        },
        {
          type: 'paragraph',
          text: 'Клетки для кроликов.',
        },
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '125 × 60 × 50 см.',
        },
      ],
    },
    price: 6990,
    kind: 'rabbit-hutch',
    images: [
      {
        localPath: '19b6a9c5-7e79-4b0a-ae83-c047cff8f347.jpg',
        sortOrder: 0,
      },
      {
        localPath: 'f01e56b4-922e-4186-a96b-47594bdb341e.jpg',
        sortOrder: 1,
      },
      {
        localPath: '9a0e6949-b26d-42dd-afef-f3fe1c423427.jpg',
        sortOrder: 2,
      },
      {
        localPath: '39bc3a0b-fb22-4fc8-ade1-0d2b120a4e21.jpg',
        sortOrder: 3,
      },
    ],
  },
  {
    seedKey: 'product-012',
    title: 'Клетка для кроликов',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Описание',
        },
        {
          type: 'paragraph',
          text: 'Деревянная клетка для кроликов.',
        },
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '120 × 60 × 60 см.',
        },
      ],
    },
    price: 6990,
    kind: 'rabbit-hutch',
    images: [
      {
        localPath: 'cbeb26f4-4860-40fc-a552-818842c83b88.jpg',
        sortOrder: 0,
      },
      {
        localPath: '0962b1f1-599f-49b7-a1d6-7890bcd8c833.jpg',
        sortOrder: 1,
      },
      {
        localPath: 'f3f5ee91-69d8-41ad-a487-ad5b4ecba37e.jpg',
        sortOrder: 2,
      },
    ],
    location: {
      name: 'Талдом',
      coordinates: {
        latitude: 56.7308,
        longitude: 37.5276,
      },
    },
  },
  {
    seedKey: 'product-013',
    title: 'Курятник до 15 кур с покраской',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '300 × 140 × 160 см.',
        },
        {
          type: 'heading',
          text: 'Материалы и конструкция',
        },
        {
          type: 'paragraph',
          text: 'Каркас: брус сухой строганный.',
        },
        {
          type: 'paragraph',
          text: 'Внутренняя отделка: ОСП 9 мм.',
        },
        {
          type: 'paragraph',
          text: 'Наружная отделка: имитация бруса 16 × 140 мм.',
        },
      ],
    },
    price: 70000,
    kind: 'chicken-coop',
    images: [
      {
        localPath: 'c45f6a31-18f3-4dfb-aee3-6e53b247dee3.jpg',
        sortOrder: 0,
      },
      {
        localPath: '2245da37-5918-4afd-a451-44186e70dd86.jpg',
        sortOrder: 1,
      },
      {
        localPath: '2bda86e2-4980-4bb9-af34-3af46f9f4bd6.jpg',
        sortOrder: 2,
      },
      {
        localPath: '8242c9f0-32fe-46cc-a4e9-dbc65456a459.jpg',
        sortOrder: 3,
      },
      {
        localPath: '5f111b48-bb79-4247-a867-e43dec82709f.jpg',
        sortOrder: 4,
      },
      {
        localPath: 'ebe29444-2fc1-4890-ac61-380dd3c5674e.jpg',
        sortOrder: 5,
      },
    ],
    insulationSurcharge: 5000,
    location: {
      name: 'Талдом',
      coordinates: {
        latitude: 56.7308,
        longitude: 37.5276,
      },
    },
  },
  {
    seedKey: 'product-014',
    title: 'Курятник на 7-8 кур',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '250 × 140 × 160 см.',
        },
      ],
    },
    price: 45000,
    kind: 'chicken-coop',
    images: [
      {
        localPath: '99449b62-dc23-464d-a981-42dc51d9b61f.jpg',
        sortOrder: 0,
      },
      {
        localPath: '90ec3fb6-cde9-4a19-aa86-7cd0f015170f.jpg',
        sortOrder: 1,
      },
    ],
    insulationSurcharge: 5000,
  },
  {
    seedKey: 'product-015',
    title: 'Курятник до 15 кур с полом',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '300 × 140 × 160 см.',
        },
        {
          type: 'heading',
          text: 'Материалы и конструкция',
        },
        {
          type: 'paragraph',
          text: 'Каркас: брус сухой строганный.',
        },
        {
          type: 'paragraph',
          text: 'Внутренняя отделка: ОСП 9 мм.',
        },
        {
          type: 'paragraph',
          text: 'Наружная отделка: имитация бруса 16 × 140 мм.',
        },
      ],
    },
    price: 80000,
    kind: 'chicken-coop',
    images: [
      {
        localPath: '8bec6ee8-329a-43f7-a6c9-f067a213491a.jpg',
        sortOrder: 0,
      },
      {
        localPath: 'cca2db8a-9396-4146-a5a5-24aeec57da77.jpg',
        sortOrder: 1,
      },
    ],
    insulationSurcharge: 5000,
    location: {
      name: 'Талдом',
      coordinates: {
        latitude: 56.7308,
        longitude: 37.5276,
      },
    },
  },
  {
    seedKey: 'product-016',
    title: 'Курятник до 15 кур с покраской',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '300 × 140 × 160 см.',
        },
        {
          type: 'heading',
          text: 'Материалы и конструкция',
        },
        {
          type: 'paragraph',
          text: 'Каркас: брус сухой строганный.',
        },
        {
          type: 'paragraph',
          text: 'Внутренняя отделка: ОСП 9 мм.',
        },
        {
          type: 'paragraph',
          text: 'Наружная отделка: имитация бруса 16 × 140 мм.',
        },
      ],
    },
    price: 70000,
    kind: 'chicken-coop',
    images: [
      {
        localPath: 'f79238b1-e134-44c9-a1d8-a205ed1d904b.jpg',
        sortOrder: 0,
      },
      {
        localPath: '07446201-2225-4374-a1b0-59023a1bd75f.jpg',
        sortOrder: 1,
      },
      {
        localPath: 'aa620cf0-56c6-4e9c-af18-b65da82be278.jpg',
        sortOrder: 2,
      },
      {
        localPath: 'f8b906af-4cbf-4a33-a1c8-3ceeb8d97c43.jpg',
        sortOrder: 3,
      },
      {
        localPath: '07cdc398-f7d7-41f7-a7cc-263e0f4ee860.jpg',
        sortOrder: 4,
      },
    ],
    insulationSurcharge: 5000,
    location: {
      name: 'Талдом',
      coordinates: {
        latitude: 56.7308,
        longitude: 37.5276,
      },
    },
  },
  {
    seedKey: 'product-017',
    title: 'Курятник до 35 кур',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '500 × 140 × 160 см.',
        },
        {
          type: 'heading',
          text: 'Материалы и конструкция',
        },
        {
          type: 'paragraph',
          text: 'Каркас: брус сухой строганный.',
        },
        {
          type: 'paragraph',
          text: 'Внутренняя отделка: ОСП 9 мм.',
        },
        {
          type: 'paragraph',
          text: 'Наружная отделка: имитация бруса 16 × 140 мм.',
        },
        {
          type: 'paragraph',
          text: 'Кровля: профнастил C8.',
        },
        {
          type: 'paragraph',
          text: 'Сетка: оцинкованная, ячейка 25 × 25 мм.',
        },
        {
          type: 'heading',
          text: 'Комплектация и особенности',
        },
        {
          type: 'paragraph',
          text: 'Гнезда, насест, трап.',
        },
      ],
    },
    price: 98000,
    kind: 'chicken-coop',
    images: [
      {
        localPath: '91e20542-5103-45e4-a06d-a7aa851cc0e9.jpg',
        sortOrder: 0,
      },
      {
        localPath: 'e71e6eef-e860-413e-aff7-4a329135c291.jpg',
        sortOrder: 1,
      },
    ],
    insulationSurcharge: 17000,
    location: {
      name: 'Талдом',
      coordinates: {
        latitude: 56.7308,
        longitude: 37.5276,
      },
    },
  },
  {
    seedKey: 'product-018',
    title: 'Курятник до 15 кур с полом',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '300 × 140 × 160 см.',
        },
        {
          type: 'heading',
          text: 'Материалы и конструкция',
        },
        {
          type: 'paragraph',
          text: 'Каркас: брус сухой строганный.',
        },
        {
          type: 'paragraph',
          text: 'Внутренняя отделка: ОСП 9 мм.',
        },
        {
          type: 'paragraph',
          text: 'Наружная отделка: имитация бруса 16 × 140 мм.',
        },
      ],
    },
    price: 80000,
    kind: 'chicken-coop',
    images: [
      {
        localPath: '598c0965-ba78-4030-a431-23e1c195f392.jpg',
        sortOrder: 0,
      },
      {
        localPath: '59e08b8f-634d-4c9b-af16-bd518bfc0275.jpg',
        sortOrder: 1,
      },
    ],
    insulationSurcharge: 5000,
    location: {
      name: 'Талдом',
      coordinates: {
        latitude: 56.7308,
        longitude: 37.5276,
      },
    },
  },
  {
    seedKey: 'product-019',
    title: 'Клетка для кроликов',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Описание',
        },
        {
          type: 'paragraph',
          text: 'Трёхъярусная клетка для кроликов.',
        },
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '200 × 60 × 60 см.',
        },
      ],
    },
    price: 39900,
    kind: 'rabbit-hutch',
    images: [
      {
        localPath: 'd46200a0-cade-4ec9-a1e4-367e8c7ce5c8.jpg',
        sortOrder: 0,
      },
      {
        localPath: '3c1f6eef-8be0-442b-a846-c8dce6845840.jpg',
        sortOrder: 1,
      },
    ],
  },
  {
    seedKey: 'product-020',
    title: 'Курятник до 15 кур с полом',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '300 × 140 × 160 см.',
        },
        {
          type: 'heading',
          text: 'Материалы и конструкция',
        },
        {
          type: 'paragraph',
          text: 'Каркас: брус сухой строганный.',
        },
        {
          type: 'paragraph',
          text: 'Внутренняя отделка: ОСП 9 мм.',
        },
        {
          type: 'paragraph',
          text: 'Наружная отделка: имитация бруса 16 × 140 мм.',
        },
        {
          type: 'paragraph',
          text: 'Крыша: двускатная.',
        },
      ],
    },
    price: 90000,
    kind: 'chicken-coop',
    images: [
      {
        localPath: 'a6d55fab-8cb8-4d5f-af4a-3381abbecf06.jpg',
        sortOrder: 0,
      },
      {
        localPath: 'f2087e65-c00b-4b59-a1cd-32c97306827f.jpg',
        sortOrder: 1,
      },
      {
        localPath: '91c7bac5-39a4-470c-a4fd-911295704930.jpg',
        sortOrder: 2,
      },
      {
        localPath: 'c3927699-a27e-4389-ac4d-16bf80599a8d.jpg',
        sortOrder: 3,
      },
    ],
    insulationSurcharge: 5000,
    location: {
      name: 'Талдом',
      coordinates: {
        latitude: 56.7308,
        longitude: 37.5276,
      },
    },
  },
  {
    seedKey: 'product-021',
    title: 'Курятник до 15 кур с полом',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '300 × 140 × 160 см.',
        },
        {
          type: 'heading',
          text: 'Материалы и конструкция',
        },
        {
          type: 'paragraph',
          text: 'Каркас: брус сухой строганный.',
        },
        {
          type: 'paragraph',
          text: 'Внутренняя отделка: ОСП 9 мм.',
        },
        {
          type: 'paragraph',
          text: 'Наружная отделка: имитация бруса 16 × 140 мм.',
        },
        {
          type: 'heading',
          text: 'Комплектация и особенности',
        },
        {
          type: 'paragraph',
          text: 'Окно и дверца выполнены из ПВХ.',
        },
      ],
    },
    price: 85000,
    kind: 'chicken-coop',
    images: [
      {
        localPath: 'b7f8cf82-7bc5-4c4e-a01c-e2988a27135c.jpg',
        sortOrder: 0,
      },
      {
        localPath: 'f79d30b0-feb9-493f-aecd-7f4a10cfad08.jpg',
        sortOrder: 1,
      },
      {
        localPath: 'f18e6761-b30c-454a-a636-b8cb15f09f74.jpg',
        sortOrder: 2,
      },
      {
        localPath: '59443e7c-8a57-4a82-a79d-c21ce4f6a15b.jpg',
        sortOrder: 3,
      },
    ],
    insulationSurcharge: 5000,
    location: {
      name: 'Талдом',
      coordinates: {
        latitude: 56.7308,
        longitude: 37.5276,
      },
    },
  },
  {
    seedKey: 'product-022',
    title: 'Курятник на 10 кур',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Описание',
        },
        {
          type: 'paragraph',
          text: 'Выгул оборудован полом.',
        },
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '300 × 140 × 160 см.',
        },
      ],
    },
    price: 94900,
    kind: 'chicken-coop',
    images: [
      {
        localPath: 'ae349835-dce3-4208-a6d0-7bcb3fcf198c.jpg',
        sortOrder: 0,
      },
      {
        localPath: '1ee0006d-a067-457c-a192-4cc2384553f6.jpg',
        sortOrder: 1,
      },
    ],
    insulationSurcharge: 5000,
  },
  {
    seedKey: 'product-023',
    title: 'Курятник до 15 кур с полом',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '300 × 140 × 160 см.',
        },
        {
          type: 'heading',
          text: 'Материалы и конструкция',
        },
        {
          type: 'paragraph',
          text: 'Каркас: брус сухой строганный.',
        },
        {
          type: 'paragraph',
          text: 'Внутренняя отделка: ОСП 9 мм.',
        },
        {
          type: 'paragraph',
          text: 'Наружная отделка: имитация бруса 16 × 140 мм.',
        },
      ],
    },
    price: 80000,
    kind: 'chicken-coop',
    images: [
      {
        localPath: 'fe73d929-dbee-4b11-a287-fc9d9680d199.jpg',
        sortOrder: 0,
      },
      {
        localPath: 'ee4e9462-a341-49fd-a46c-4589a16589c0.jpg',
        sortOrder: 1,
      },
      {
        localPath: '067ff93f-0260-478f-a4dc-5956c93c3dfa.jpg',
        sortOrder: 2,
      },
    ],
    insulationSurcharge: 5000,
    location: {
      name: 'Талдом',
      coordinates: {
        latitude: 56.7308,
        longitude: 37.5276,
      },
    },
  },
  {
    seedKey: 'product-024',
    title: 'Курятник до 15 кур двускат',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '300 × 140 × 160 см.',
        },
        {
          type: 'heading',
          text: 'Материалы и конструкция',
        },
        {
          type: 'paragraph',
          text: 'Каркас: брус сухой строганный.',
        },
        {
          type: 'paragraph',
          text: 'Внутренняя отделка: ОСП 9 мм.',
        },
        {
          type: 'paragraph',
          text: 'Наружная отделка: имитация бруса 16 × 140 мм.',
        },
        {
          type: 'paragraph',
          text: 'Крыша: двускатная.',
        },
      ],
    },
    price: 80000,
    kind: 'chicken-coop',
    images: [
      {
        localPath: '047fbb5e-725d-4287-ae67-05bcab7099ec.jpg',
        sortOrder: 0,
      },
      {
        localPath: '0417916b-69c4-4ff6-a65b-919023419a7b.jpg',
        sortOrder: 1,
      },
      {
        localPath: 'd77d4abd-c4c7-4cc4-a1a5-18c46d81970d.jpg',
        sortOrder: 2,
      },
      {
        localPath: '4aac30ae-409f-4f35-ac31-4623767d608d.jpg',
        sortOrder: 3,
      },
    ],
    insulationSurcharge: 5000,
    location: {
      name: 'Талдом',
      coordinates: {
        latitude: 56.7308,
        longitude: 37.5276,
      },
    },
  },
  {
    seedKey: 'product-025',
    title: 'Курятник до 15 кур с выносом под гнезда',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Описание',
        },
        {
          type: 'paragraph',
          text: 'Модель с выносным гнездом и настилом в загоне.',
        },
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '300 × 140 × 160 см.',
        },
        {
          type: 'heading',
          text: 'Материалы и конструкция',
        },
        {
          type: 'paragraph',
          text: 'Каркас: брус сухой строганный.',
        },
        {
          type: 'paragraph',
          text: 'Внутренняя отделка: ОСП 9 мм.',
        },
        {
          type: 'paragraph',
          text: 'Наружная отделка: имитация бруса 16 × 140 мм.',
        },
        {
          type: 'heading',
          text: 'Комплектация и особенности',
        },
        {
          type: 'paragraph',
          text: 'Настил в загоне помогает сохранять птицу чистой и сухой, упрощает уборку и обеспечивает дополнительную защиту от хищников.',
        },
        {
          type: 'paragraph',
          text: 'Выносное утеплённое гнездо увеличивает полезную площадь домика, упрощает сбор яиц и защищает их от замерзания.',
        },
      ],
    },
    price: 83000,
    kind: 'chicken-coop',
    images: [
      {
        localPath: 'dc823ff2-f0cb-44b0-a762-f99efd2e826e.jpg',
        sortOrder: 0,
      },
      {
        localPath: '66406030-f644-4bd2-a541-5a00e596066a.jpg',
        sortOrder: 1,
      },
      {
        localPath: '096ec15f-a6bd-4195-aba3-bb0095d93632.jpg',
        sortOrder: 2,
      },
    ],
    insulationSurcharge: 5000,
    location: {
      name: 'Талдом',
      coordinates: {
        latitude: 56.7308,
        longitude: 37.5276,
      },
    },
  },
  {
    seedKey: 'product-026',
    title: 'Курятник до 15 кур с покраской двускат',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '300 × 140 × 160 см.',
        },
        {
          type: 'heading',
          text: 'Материалы и конструкция',
        },
        {
          type: 'paragraph',
          text: 'Каркас: брус сухой строганный.',
        },
        {
          type: 'paragraph',
          text: 'Внутренняя отделка: ОСП 9 мм.',
        },
        {
          type: 'paragraph',
          text: 'Наружная отделка: имитация бруса 16 × 140 мм.',
        },
      ],
    },
    price: 75000,
    kind: 'chicken-coop',
    images: [
      {
        localPath: 'c324c6de-d160-4744-af7b-922d3c433a5c.jpg',
        sortOrder: 0,
      },
      {
        localPath: 'afeae3e1-179c-4355-a662-5d4d16989f60.jpg',
        sortOrder: 1,
      },
      {
        localPath: '0492bc7e-3706-4d2c-ac24-8758b521ccec.jpg',
        sortOrder: 2,
      },
      {
        localPath: '0f9c1ab2-f303-499f-adae-c48b679d925a.jpg',
        sortOrder: 3,
      },
    ],
    insulationSurcharge: 5000,
    location: {
      name: 'Талдом',
      coordinates: {
        latitude: 56.7308,
        longitude: 37.5276,
      },
    },
  },
  {
    seedKey: 'product-027',
    title: 'Курятник до 15 кур с покраской',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '300 × 140 × 160 см.',
        },
        {
          type: 'heading',
          text: 'Материалы и конструкция',
        },
        {
          type: 'paragraph',
          text: 'Каркас: брус сухой строганный.',
        },
        {
          type: 'paragraph',
          text: 'Внутренняя отделка: ОСП 9 мм.',
        },
        {
          type: 'paragraph',
          text: 'Наружная отделка: имитация бруса 16 × 140 мм.',
        },
      ],
    },
    price: 70000,
    kind: 'chicken-coop',
    images: [
      {
        localPath: '468ae017-d297-48a2-a272-0fceaad1045a.jpg',
        sortOrder: 0,
      },
      {
        localPath: 'a5c0c077-f5bd-4b2f-a13a-37f2a5b3b1ae.jpg',
        sortOrder: 1,
      },
      {
        localPath: '6453f53c-35e4-496b-a450-607f474c4092.jpg',
        sortOrder: 2,
      },
      {
        localPath: 'bd7b59c0-4d37-4d87-a412-95f69061d5db.jpg',
        sortOrder: 3,
      },
    ],
    insulationSurcharge: 5000,
    location: {
      name: 'Талдом',
      coordinates: {
        latitude: 56.7308,
        longitude: 37.5276,
      },
    },
  },
  {
    seedKey: 'product-028',
    title: 'Курятник до 15 кур с покраской и полом',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '300 × 140 × 160 см.',
        },
        {
          type: 'heading',
          text: 'Материалы и конструкция',
        },
        {
          type: 'paragraph',
          text: 'Каркас: брус сухой строганный.',
        },
        {
          type: 'paragraph',
          text: 'Внутренняя отделка: ОСП 9 мм.',
        },
        {
          type: 'paragraph',
          text: 'Наружная отделка: имитация бруса 16 × 140 мм.',
        },
      ],
    },
    price: 75000,
    kind: 'chicken-coop',
    images: [
      {
        localPath: 'fe747bd7-dfbc-403b-a4cb-934221b89ff7.jpg',
        sortOrder: 0,
      },
      {
        localPath: '4a5a8c60-e816-4276-a2b4-adaa6ba24a66.jpg',
        sortOrder: 1,
      },
      {
        localPath: 'efd445e8-0494-483c-a08b-08d2d65411da.jpg',
        sortOrder: 2,
      },
      {
        localPath: '02a1edc5-2264-437b-af3f-90024e167655.jpg',
        sortOrder: 3,
      },
    ],
    insulationSurcharge: 5000,
    location: {
      name: 'Талдом',
      coordinates: {
        latitude: 56.7308,
        longitude: 37.5276,
      },
    },
  },
  {
    seedKey: 'product-029',
    title: 'Курятник до 15 кур с покраской',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '300 × 140 × 160 см.',
        },
        {
          type: 'heading',
          text: 'Материалы и конструкция',
        },
        {
          type: 'paragraph',
          text: 'Каркас: брус сухой строганный.',
        },
        {
          type: 'paragraph',
          text: 'Внутренняя отделка: ОСП 9 мм.',
        },
        {
          type: 'paragraph',
          text: 'Наружная отделка: имитация бруса 16 × 140 мм.',
        },
      ],
    },
    price: 70000,
    kind: 'chicken-coop',
    images: [
      {
        localPath: 'c3eac0dd-1303-4ac7-a048-2e1398cbabab.jpg',
        sortOrder: 0,
      },
      {
        localPath: '365d1141-18b8-4ca2-ab08-0a3a62980a83.jpg',
        sortOrder: 1,
      },
      {
        localPath: '74c63238-5295-4a1c-ab05-4c4e8bba2ab1.jpg',
        sortOrder: 2,
      },
    ],
    insulationSurcharge: 5000,
    location: {
      name: 'Талдом',
      coordinates: {
        latitude: 56.7308,
        longitude: 37.5276,
      },
    },
  },
  {
    seedKey: 'product-030',
    title: 'Курятник до 15 кур с покраской переносной',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '300 × 140 × 160 см.',
        },
        {
          type: 'heading',
          text: 'Материалы и конструкция',
        },
        {
          type: 'paragraph',
          text: 'Каркас: брус сухой строганный.',
        },
        {
          type: 'paragraph',
          text: 'Внутренняя отделка: ОСП 9 мм.',
        },
        {
          type: 'paragraph',
          text: 'Наружная отделка: имитация бруса 16 × 140 мм.',
        },
      ],
    },
    price: 75000,
    kind: 'chicken-coop',
    images: [
      {
        localPath: 'cb483440-1395-4c5a-a23d-7dc04fa6a86a.jpg',
        sortOrder: 0,
      },
      {
        localPath: 'd59a52f6-8cf7-49ee-ac11-4a797d36302c.jpg',
        sortOrder: 1,
      },
      {
        localPath: '8b317fb8-3db0-42dd-aa63-e69fd1abb746.jpg',
        sortOrder: 2,
      },
    ],
    insulationSurcharge: 10000,
    location: {
      name: 'Талдом',
      coordinates: {
        latitude: 56.7308,
        longitude: 37.5276,
      },
    },
  },
  {
    seedKey: 'product-031',
    title: 'Курятник до 15 кур с покраской двускат',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '300 × 140 × 160 см.',
        },
        {
          type: 'heading',
          text: 'Материалы и конструкция',
        },
        {
          type: 'paragraph',
          text: 'Каркас: брус сухой строганный.',
        },
        {
          type: 'paragraph',
          text: 'Внутренняя отделка: ОСП 9 мм.',
        },
        {
          type: 'paragraph',
          text: 'Наружная отделка: имитация бруса 16 × 140 мм.',
        },
        {
          type: 'paragraph',
          text: 'Крыша: двускатная, мягкая черепица.',
        },
      ],
    },
    price: 75000,
    kind: 'chicken-coop',
    images: [
      {
        localPath: '6902be76-2b5d-402c-a3c4-8ae6a057005d.jpg',
        sortOrder: 0,
      },
      {
        localPath: '1879e94a-b2cd-44eb-acc2-b19f71f34db4.jpg',
        sortOrder: 1,
      },
      {
        localPath: 'd725a759-0158-485c-a685-f595ca5cceb2.jpg',
        sortOrder: 2,
      },
      {
        localPath: '3c7f9073-93fd-4329-a3ce-cb0a7418eec9.jpg',
        sortOrder: 3,
      },
    ],
    insulationSurcharge: 10000,
    location: {
      name: 'Талдом',
      coordinates: {
        latitude: 56.7308,
        longitude: 37.5276,
      },
    },
  },
  {
    seedKey: 'product-032',
    title: 'Курятник до 15 кур с покраской двускат',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '300 × 140 × 160 см.',
        },
        {
          type: 'heading',
          text: 'Материалы и конструкция',
        },
        {
          type: 'paragraph',
          text: 'Каркас: брус сухой строганный.',
        },
        {
          type: 'paragraph',
          text: 'Внутренняя отделка: ОСП 9 мм.',
        },
        {
          type: 'paragraph',
          text: 'Наружная отделка: имитация бруса 16 × 140 мм.',
        },
        {
          type: 'paragraph',
          text: 'Крыша: двускатная, мягкая черепица.',
        },
      ],
    },
    price: 75000,
    kind: 'chicken-coop',
    images: [
      {
        localPath: 'd94659a9-1142-4a0d-a40e-b4afa2205004.jpg',
        sortOrder: 0,
      },
      {
        localPath: '9a187063-455e-4260-a0b0-b7d680ea6891.jpg',
        sortOrder: 1,
      },
      {
        localPath: 'c8640eeb-c254-49cd-a724-779a76a97db5.jpg',
        sortOrder: 2,
      },
      {
        localPath: '00ec13d3-a4f7-4692-af57-6f7ffd40f138.jpg',
        sortOrder: 3,
      },
      {
        localPath: 'f82e24a9-fe2c-4e49-a5b8-74274d6bdf8f.jpg',
        sortOrder: 4,
      },
    ],
    insulationSurcharge: 10000,
    location: {
      name: 'Талдом',
      coordinates: {
        latitude: 56.7308,
        longitude: 37.5276,
      },
    },
  },
  {
    seedKey: 'product-033',
    title: 'Курятник до 15 кур с покраской двускат',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '300 × 140 × 160 см.',
        },
        {
          type: 'heading',
          text: 'Материалы и конструкция',
        },
        {
          type: 'paragraph',
          text: 'Каркас: брус сухой строганный.',
        },
        {
          type: 'paragraph',
          text: 'Внутренняя отделка: ОСП 9 мм.',
        },
        {
          type: 'paragraph',
          text: 'Наружная отделка: имитация бруса 16 × 140 мм.',
        },
        {
          type: 'paragraph',
          text: 'Крыша: двускатная, мягкая черепица.',
        },
      ],
    },
    price: 75000,
    kind: 'chicken-coop',
    images: [
      {
        localPath: 'a14a8700-7b7d-4c3f-a0a1-9805517da9e2.jpg',
        sortOrder: 0,
      },
      {
        localPath: '17800b5e-8ba3-4da6-a24d-b55c143447cc.jpg',
        sortOrder: 1,
      },
    ],
    insulationSurcharge: 10000,
    location: {
      name: 'Талдом',
      coordinates: {
        latitude: 56.7308,
        longitude: 37.5276,
      },
    },
  },
  {
    seedKey: 'product-034',
    title: 'Курятник до 15 кур с покраской двускат',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '300 × 140 × 160 см.',
        },
        {
          type: 'heading',
          text: 'Материалы и конструкция',
        },
        {
          type: 'paragraph',
          text: 'Каркас: брус сухой строганный.',
        },
        {
          type: 'paragraph',
          text: 'Внутренняя отделка: ОСП 9 мм.',
        },
        {
          type: 'paragraph',
          text: 'Наружная отделка: имитация бруса 16 × 140 мм.',
        },
        {
          type: 'paragraph',
          text: 'Крыша: двускатная, мягкая черепица.',
        },
      ],
    },
    price: 75000,
    kind: 'chicken-coop',
    images: [
      {
        localPath: '10710fd3-97fe-4d02-aa2f-eaf85fa3d2bc.jpg',
        sortOrder: 0,
      },
      {
        localPath: 'bd9f4880-e2e6-4fb8-abfe-ab8a5164647b.jpg',
        sortOrder: 1,
      },
      {
        localPath: 'f4d71aa2-1698-411c-acae-09109c179df0.jpg',
        sortOrder: 2,
      },
      {
        localPath: 'ba007c92-b882-44dd-a8e7-719c10d087f9.jpg',
        sortOrder: 3,
      },
    ],
    insulationSurcharge: 10000,
    location: {
      name: 'Талдом',
      coordinates: {
        latitude: 56.7308,
        longitude: 37.5276,
      },
    },
  },
  {
    seedKey: 'product-035',
    title: 'Курятник до 15 кур',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '300 × 140 × 170 см.',
        },
        {
          type: 'heading',
          text: 'Материалы и конструкция',
        },
        {
          type: 'paragraph',
          text: 'Каркас: брус сухой строганный.',
        },
        {
          type: 'paragraph',
          text: 'Внутренняя отделка: ОСП 9 мм.',
        },
        {
          type: 'paragraph',
          text: 'Наружная отделка: имитация бруса 16 × 140 мм.',
        },
        {
          type: 'paragraph',
          text: 'Сетка: оцинкованная, ячейка 25 × 25 мм.',
        },
        {
          type: 'heading',
          text: 'Комплектация и особенности',
        },
        {
          type: 'paragraph',
          text: 'Гнезда, насест, трап.',
        },
      ],
    },
    price: 70000,
    kind: 'chicken-coop',
    images: [
      {
        localPath: 'af95bd4c-5b56-43af-a754-3eb8c997ad27.jpg',
        sortOrder: 0,
      },
      {
        localPath: '37792c4c-7b49-4e82-a7c5-840d6d99ab5b.jpg',
        sortOrder: 1,
      },
      {
        localPath: '346ad0ec-f2f1-4477-adac-1b80cbe1a37b.jpg',
        sortOrder: 2,
      },
      {
        localPath: 'bc11ec23-6eba-4187-a51c-503e8c34b7c1.jpg',
        sortOrder: 3,
      },
    ],
    insulationSurcharge: 5000,
    location: {
      name: 'Талдом',
      coordinates: {
        latitude: 56.7308,
        longitude: 37.5276,
      },
    },
  },
  {
    seedKey: 'product-036',
    title: 'Курятник до 15 кур',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '300 × 140 × 170 см.',
        },
        {
          type: 'heading',
          text: 'Материалы и конструкция',
        },
        {
          type: 'paragraph',
          text: 'Каркас: брус сухой строганный.',
        },
        {
          type: 'paragraph',
          text: 'Внутренняя отделка: ОСП 9 мм.',
        },
        {
          type: 'paragraph',
          text: 'Наружная отделка: имитация бруса 16 × 140 мм.',
        },
        {
          type: 'paragraph',
          text: 'Сетка: оцинкованная, ячейка 25 × 25 мм.',
        },
        {
          type: 'heading',
          text: 'Комплектация и особенности',
        },
        {
          type: 'paragraph',
          text: 'Гнезда, насест, трап.',
        },
      ],
    },
    price: 70000,
    kind: 'chicken-coop',
    images: [
      {
        localPath: '3e5025a9-c1c6-46e6-aa22-cf4134080a31.jpg',
        sortOrder: 0,
      },
      {
        localPath: '2d2d1093-c2fb-440c-ac4e-a47b75497eb2.jpg',
        sortOrder: 1,
      },
      {
        localPath: 'be6fcba3-a13a-4d1a-a309-4945c2c27218.jpg',
        sortOrder: 2,
      },
      {
        localPath: 'f0ef072d-67bd-4db7-a6ff-3a8c9234a280.jpg',
        sortOrder: 3,
      },
    ],
    insulationSurcharge: 5000,
    location: {
      name: 'Талдом',
      coordinates: {
        latitude: 56.7308,
        longitude: 37.5276,
      },
    },
  },
  {
    seedKey: 'product-037',
    title: 'Крольчатник / Клетка для кур',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Описание',
        },
        {
          type: 'paragraph',
          text: 'Двенадцатиместный комплекс в три яруса для содержания кроликов или кур.',
        },
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '300 × 60 × 190 см.',
        },
      ],
    },
    price: 79900,
    kind: 'universal-cage',
    images: [
      {
        localPath: '5c280716-a8aa-4e7b-a964-d9b8d0d8fdbe.jpg',
        sortOrder: 0,
      },
      {
        localPath: 'ee76f97b-a0da-48d6-a3b3-478ca6f2344c.jpg',
        sortOrder: 1,
      },
      {
        localPath: '30234814-1408-4576-a584-b8f43eaa3ddd.jpg',
        sortOrder: 2,
      },
    ],
  },
  {
    seedKey: 'product-038',
    title: 'Курятник до 15 кур с тамбуром',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '300 × 140 × 160 см.',
        },
        {
          type: 'heading',
          text: 'Материалы и конструкция',
        },
        {
          type: 'paragraph',
          text: 'Каркас: брус сухой строганный.',
        },
        {
          type: 'paragraph',
          text: 'Внутренняя отделка: ОСП 9 мм.',
        },
        {
          type: 'paragraph',
          text: 'Наружная отделка: имитация бруса 16 × 140 мм.',
        },
        {
          type: 'paragraph',
          text: 'Кровля: профнастил C8.',
        },
        {
          type: 'paragraph',
          text: 'Сетка: оцинкованная, ячейка 25 × 25 мм.',
        },
        {
          type: 'heading',
          text: 'Комплектация и особенности',
        },
        {
          type: 'paragraph',
          text: 'Гнезда, насест, трап.',
        },
      ],
    },
    price: 70000,
    kind: 'chicken-coop',
    images: [
      {
        localPath: 'b6056368-7fee-4ac3-ae6a-9ec3ce0c61a1.jpg',
        sortOrder: 0,
      },
      {
        localPath: '953ba0ff-e9d4-4a14-adb0-c4c8ecb2fde0.jpg',
        sortOrder: 1,
      },
      {
        localPath: 'f505738c-9e9c-4766-aed0-c814424ddd23.jpg',
        sortOrder: 2,
      },
      {
        localPath: 'ae464cad-f18b-49c5-a8ed-4368afd40be8.jpg',
        sortOrder: 3,
      },
      {
        localPath: '2eefec09-b95b-420e-adac-00e9f5ccf52b.jpg',
        sortOrder: 4,
      },
    ],
    insulationSurcharge: 5000,
    location: {
      name: 'Талдом',
      coordinates: {
        latitude: 56.7308,
        longitude: 37.5276,
      },
    },
  },
  {
    seedKey: 'product-039',
    title: 'Курятник на 10 кур с покраской',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '250 × 140 × 160 см.',
        },
        {
          type: 'heading',
          text: 'Материалы и конструкция',
        },
        {
          type: 'paragraph',
          text: 'Каркас: брус сухой строганный.',
        },
        {
          type: 'paragraph',
          text: 'Внутренняя отделка: ОСП 9 мм.',
        },
        {
          type: 'paragraph',
          text: 'Наружная отделка: имитация бруса 16 × 140 мм.',
        },
        {
          type: 'paragraph',
          text: 'Кровля: профнастил C8.',
        },
        {
          type: 'paragraph',
          text: 'Сетка: оцинкованная, ячейка 25 × 25 мм.',
        },
        {
          type: 'heading',
          text: 'Комплектация и особенности',
        },
        {
          type: 'paragraph',
          text: 'Гнезда, насест, трап.',
        },
      ],
    },
    price: 75000,
    kind: 'chicken-coop',
    images: [
      {
        localPath: '0051d6c4-127f-4c6a-ac3f-698a56a1aabe.jpg',
        sortOrder: 0,
      },
      {
        localPath: 'd6e598cb-1f0f-4c3c-aaed-906f7a8d9b54.jpg',
        sortOrder: 1,
      },
      {
        localPath: '3b8884e0-78f4-4cdc-a2ce-f3c108ade9c5.jpg',
        sortOrder: 2,
      },
      {
        localPath: '76b647ca-2eb9-402a-a548-f510165f5f6f.jpg',
        sortOrder: 3,
      },
    ],
    insulationSurcharge: 5000,
    location: {
      name: 'Талдом',
      coordinates: {
        latitude: 56.7308,
        longitude: 37.5276,
      },
    },
  },
  {
    seedKey: 'product-040',
    title: 'Курятник на 7 кур с покраской',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Описание',
        },
        {
          type: 'paragraph',
          text: 'Компактный, но вместительный домик, рассчитанный на семь кур.',
        },
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '200 × 100 × 180 см.',
        },
        {
          type: 'heading',
          text: 'Материалы и конструкция',
        },
        {
          type: 'paragraph',
          text: 'Крыша: двускатная.',
        },
        {
          type: 'heading',
          text: 'Комплектация и особенности',
        },
        {
          type: 'paragraph',
          text: 'Курятник оснащён электрикой и деревянным полом в загоне.',
        },
      ],
    },
    price: 65000,
    kind: 'chicken-coop',
    images: [
      {
        localPath: 'd1783e6d-3694-4646-aff0-2bf9d473745f.jpg',
        sortOrder: 0,
      },
      {
        localPath: 'e1b19f64-7832-42f8-ace0-123a60a68563.jpg',
        sortOrder: 1,
      },
      {
        localPath: 'f911bf5c-244b-4ee6-ac8e-8ed3a0e829ca.jpg',
        sortOrder: 2,
      },
      {
        localPath: 'f44f1e03-d006-4d61-a1c9-ae1c2aa40929.jpg',
        sortOrder: 3,
      },
    ],
    insulationSurcharge: 5000,
  },
  {
    seedKey: 'product-041',
    title: 'Курятник до 15 кур с покраской',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '300 × 140 × 160 см.',
        },
        {
          type: 'heading',
          text: 'Материалы и конструкция',
        },
        {
          type: 'paragraph',
          text: 'Каркас: брус сухой строганный.',
        },
        {
          type: 'paragraph',
          text: 'Внутренняя отделка: ОСП 9 мм.',
        },
        {
          type: 'paragraph',
          text: 'Наружная отделка: имитация бруса 16 × 140 мм.',
        },
      ],
    },
    price: 70000,
    kind: 'chicken-coop',
    images: [
      {
        localPath: '639b7300-e6eb-4061-acb5-8f00f835be71.jpg',
        sortOrder: 0,
      },
      {
        localPath: '117e45af-78bb-4fbe-a96e-a77cb2297ecf.jpg',
        sortOrder: 1,
      },
      {
        localPath: '4c0cd2f2-2ce6-4aaf-a93e-c49f80a0cf67.jpg',
        sortOrder: 2,
      },
      {
        localPath: 'ab1cdde7-5af9-4e64-a0c0-831c6836adc4.jpg',
        sortOrder: 3,
      },
      {
        localPath: '314f05a3-eaf6-4544-a5ab-fd0d838fadaa.jpg',
        sortOrder: 4,
      },
    ],
    insulationSurcharge: 5000,
    location: {
      name: 'Талдом',
      coordinates: {
        latitude: 56.7308,
        longitude: 37.5276,
      },
    },
  },
  {
    seedKey: 'product-042',
    title: 'Курятник до 15 кур с покраской',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '300 × 140 × 160 см.',
        },
        {
          type: 'heading',
          text: 'Материалы и конструкция',
        },
        {
          type: 'paragraph',
          text: 'Каркас: брус сухой строганный.',
        },
        {
          type: 'paragraph',
          text: 'Внутренняя отделка: ОСП 9 мм.',
        },
        {
          type: 'paragraph',
          text: 'Наружная отделка: имитация бруса 16 × 140 мм.',
        },
      ],
    },
    price: 70000,
    kind: 'chicken-coop',
    images: [
      {
        localPath: '2248ebce-5d5c-4d20-aa73-56b826bb651f.jpg',
        sortOrder: 0,
      },
      {
        localPath: '437b921b-d06a-4448-a3ce-c8dd3db2c6d9.jpg',
        sortOrder: 1,
      },
      {
        localPath: 'cf99925f-e806-4a4e-a5e1-92945ab41858.jpg',
        sortOrder: 2,
      },
      {
        localPath: 'a0279bb5-e61b-4357-a56e-5128eca89021.jpg',
        sortOrder: 3,
      },
    ],
    insulationSurcharge: 5000,
    location: {
      name: 'Талдом',
      coordinates: {
        latitude: 56.7308,
        longitude: 37.5276,
      },
    },
  },
  {
    seedKey: 'product-043',
    title: 'Курятник до 15 кур с покраской',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '300 × 140 × 160 см.',
        },
        {
          type: 'heading',
          text: 'Материалы и конструкция',
        },
        {
          type: 'paragraph',
          text: 'Каркас: брус сухой строганный.',
        },
        {
          type: 'paragraph',
          text: 'Внутренняя отделка: ОСП 9 мм.',
        },
        {
          type: 'paragraph',
          text: 'Наружная отделка: имитация бруса 16 × 140 мм.',
        },
      ],
    },
    price: 75000,
    kind: 'chicken-coop',
    images: [
      {
        localPath: '4067120b-b6db-45ae-a976-a942bf71fed1.jpg',
        sortOrder: 0,
      },
      {
        localPath: '66862639-e6fd-4c10-a771-4b3a0c7769e3.jpg',
        sortOrder: 1,
      },
      {
        localPath: '9136b0d4-5d29-407e-a0a6-c615be01c705.jpg',
        sortOrder: 2,
      },
    ],
    insulationSurcharge: 5000,
    location: {
      name: 'Талдом',
      coordinates: {
        latitude: 56.7308,
        longitude: 37.5276,
      },
    },
  },
  {
    seedKey: 'product-044',
    title: 'Курятник до 15 кур с покраской',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '300 × 140 × 160 см.',
        },
        {
          type: 'heading',
          text: 'Материалы и конструкция',
        },
        {
          type: 'paragraph',
          text: 'Каркас: брус сухой строганный.',
        },
        {
          type: 'paragraph',
          text: 'Внутренняя отделка: ОСП 9 мм.',
        },
        {
          type: 'paragraph',
          text: 'Наружная отделка: имитация бруса 16 × 140 мм.',
        },
      ],
    },
    price: 70000,
    kind: 'chicken-coop',
    images: [
      {
        localPath: 'ab082f52-f101-4f22-a356-3bd9c69d7971.jpg',
        sortOrder: 0,
      },
      {
        localPath: '7c03547f-840e-484a-af9f-e81101fb387f.jpg',
        sortOrder: 1,
      },
      {
        localPath: '524b67f0-0484-427f-a5c9-716aede588ee.jpg',
        sortOrder: 2,
      },
      {
        localPath: 'c0e53493-b297-48a9-ad4a-e8f2fd187540.jpg',
        sortOrder: 3,
      },
    ],
    insulationSurcharge: 5000,
    location: {
      name: 'Талдом',
      coordinates: {
        latitude: 56.7308,
        longitude: 37.5276,
      },
    },
  },
  {
    seedKey: 'product-045',
    title: 'Курятник до 8 кур с покраской',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '200 × 140 × 160 см.',
        },
        {
          type: 'heading',
          text: 'Материалы и конструкция',
        },
        {
          type: 'paragraph',
          text: 'Каркас: брус сухой строганный.',
        },
        {
          type: 'paragraph',
          text: 'Внутренняя отделка: ОСП 9 мм.',
        },
        {
          type: 'paragraph',
          text: 'Наружная отделка: имитация бруса 16 × 140 мм.',
        },
      ],
    },
    price: 60000,
    kind: 'chicken-coop',
    images: [
      {
        localPath: 'd9677efb-edca-4a52-a683-6479d788556a.jpg',
        sortOrder: 0,
      },
      {
        localPath: '80420b47-e254-44e7-afba-8bf8fc9aff8f.jpg',
        sortOrder: 1,
      },
      {
        localPath: '71aab9ea-bc9f-4cf5-ae3f-b748a27dc6cd.jpg',
        sortOrder: 2,
      },
      {
        localPath: 'fb9b3647-ec66-475f-ad8d-04c8c6c4f859.jpg',
        sortOrder: 3,
      },
    ],
    insulationSurcharge: 5000,
    location: {
      name: 'Талдом',
      coordinates: {
        latitude: 56.7308,
        longitude: 37.5276,
      },
    },
  },
  {
    seedKey: 'product-046',
    title: 'Курятник на 10 кур с покраской',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '250 × 140 × 160 см.',
        },
        {
          type: 'heading',
          text: 'Материалы и конструкция',
        },
        {
          type: 'paragraph',
          text: 'Каркас: брус сухой строганный.',
        },
        {
          type: 'paragraph',
          text: 'Внутренняя отделка: ОСП 9 мм.',
        },
        {
          type: 'paragraph',
          text: 'Наружная отделка: имитация бруса 16 × 140 мм.',
        },
      ],
    },
    price: 65000,
    kind: 'chicken-coop',
    images: [
      {
        localPath: '6a66b4e8-0d29-424e-a7ba-fa6b1e756f31.jpg',
        sortOrder: 0,
      },
      {
        localPath: '0ddf0145-6aba-444d-ab88-0a7d0c53b687.jpg',
        sortOrder: 1,
      },
      {
        localPath: 'd9674e6b-6dc6-4800-a1db-edf2bb329354.jpg',
        sortOrder: 2,
      },
      {
        localPath: '4055b54f-ca49-439d-a6c0-668da5f88b77.jpg',
        sortOrder: 3,
      },
      {
        localPath: '9bab05ad-eb6a-4d7e-aa6b-c9d8b464edf4.jpg',
        sortOrder: 4,
      },
    ],
    insulationSurcharge: 5000,
    location: {
      name: 'Талдом',
      coordinates: {
        latitude: 56.7308,
        longitude: 37.5276,
      },
    },
  },
  {
    seedKey: 'product-047',
    title: 'Курятник до 15 кур с выносом под гнезда',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '300 × 140 × 160 см.',
        },
        {
          type: 'heading',
          text: 'Материалы и конструкция',
        },
        {
          type: 'paragraph',
          text: 'Каркас: брус сухой строганный.',
        },
        {
          type: 'paragraph',
          text: 'Внутренняя отделка: ОСП 9 мм.',
        },
        {
          type: 'paragraph',
          text: 'Наружная отделка: имитация бруса 16 × 140 мм.',
        },
        {
          type: 'paragraph',
          text: 'Кровля: профнастил C8.',
        },
        {
          type: 'paragraph',
          text: 'Сетка: оцинкованная, ячейка 25 × 25 мм.',
        },
        {
          type: 'heading',
          text: 'Комплектация и особенности',
        },
        {
          type: 'paragraph',
          text: 'Гнезда, насест, трап.',
        },
      ],
    },
    price: 60000,
    kind: 'chicken-coop',
    images: [
      {
        localPath: 'f715f047-1092-44bf-a315-3b9fcfc6cb73.jpg',
        sortOrder: 0,
      },
      {
        localPath: '013630e8-958f-49dd-a125-644410ed237e.jpg',
        sortOrder: 1,
      },
      {
        localPath: '2756cdaf-301c-48e6-ad4e-813e5f5f81e9.jpg',
        sortOrder: 2,
      },
      {
        localPath: '10750f12-89ac-4aac-af18-a0c2966c7236.jpg',
        sortOrder: 3,
      },
    ],
    insulationSurcharge: 5000,
    location: {
      name: 'Талдом',
      coordinates: {
        latitude: 56.7308,
        longitude: 37.5276,
      },
    },
  },
  {
    seedKey: 'product-048',
    title: 'Курятник на 5 кур с покраской',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '170 × 140 × 160 см.',
        },
        {
          type: 'heading',
          text: 'Материалы и конструкция',
        },
        {
          type: 'paragraph',
          text: 'Каркас: брус сухой строганный.',
        },
        {
          type: 'paragraph',
          text: 'Внутренняя отделка: ОСП 9 мм.',
        },
        {
          type: 'paragraph',
          text: 'Наружная отделка: имитация бруса 16 × 140 мм.',
        },
      ],
    },
    price: 43000,
    kind: 'chicken-coop',
    images: [
      {
        localPath: '49785d26-4f09-451d-a68a-64eb5943ab2e.jpg',
        sortOrder: 0,
      },
      {
        localPath: '2b493add-a8fa-4e39-a2b9-b7eaef683401.jpg',
        sortOrder: 1,
      },
    ],
    insulationSurcharge: 5000,
    location: {
      name: 'Талдом',
      coordinates: {
        latitude: 56.7308,
        longitude: 37.5276,
      },
    },
  },
  {
    seedKey: 'product-049',
    title: 'Курятник до 15 кур с полом',
    description: {
      blocks: [
        {
          type: 'heading',
          text: 'Размеры',
        },
        {
          type: 'paragraph',
          text: '300 × 140 × 160 см.',
        },
        {
          type: 'heading',
          text: 'Материалы и конструкция',
        },
        {
          type: 'paragraph',
          text: 'Каркас: брус сухой строганный.',
        },
        {
          type: 'paragraph',
          text: 'Внутренняя отделка: ОСП 9 мм.',
        },
        {
          type: 'paragraph',
          text: 'Наружная отделка: имитация бруса 16 × 140 мм.',
        },
      ],
    },
    price: 80000,
    kind: 'chicken-coop',
    images: [
      {
        localPath: 'bd75f34e-71a7-4b5b-a869-662d2a602628.jpg',
        sortOrder: 0,
      },
      {
        localPath: 'ac0a7028-5dd7-41d1-a884-93bbfec71226.jpg',
        sortOrder: 1,
      },
      {
        localPath: '31140ba5-656f-4993-ae0f-5c1b9980c939.jpg',
        sortOrder: 2,
      },
      {
        localPath: 'b91082d5-8f8f-42d1-aa96-e68ee3e01625.jpg',
        sortOrder: 3,
      },
    ],
    insulationSurcharge: 5000,
    location: {
      name: 'Талдом',
      coordinates: {
        latitude: 56.7308,
        longitude: 37.5276,
      },
    },
  },
];
type PreparedImage = {
  sourcePath: string;
  fileName: string;
  destinationPath: string;
  publicUrl: string;
  sortOrder: number;
};

type ProductKind = 'chicken-coop' | 'rabbit-hutch' | 'universal-cage';

type ImportResult = {
  seedKey: string;
  title: string;
  slug: string;
  price: number;
  categoryName: string;
  imagesCount: number;
  action: 'created' | 'updated';
};

type CategoryDefinition = {
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
};

const SEED_ASSETS_DIR = join(
  process.cwd(),
  'prisma',
  'seeds',
  'production',
  'assets',
  'products',
);

const ROOT_CATEGORY: CategoryDefinition = {
  name: 'Постройки и клетки для животных',
  slug: 'postroyki-i-kletki-dlya-zhivotnyh',
  description: 'Курятники, крольчатники и универсальные хозяйственные клетки.',
  sortOrder: 1,
};

const CATEGORY_DEFINITIONS: Record<ProductKind, CategoryDefinition> = {
  'chicken-coop': {
    name: 'Курятники',
    slug: 'kuryatniki',
    description: 'Курятники различных размеров, конструкций и комплектаций.',
    sortOrder: 1,
  },
  'rabbit-hutch': {
    name: 'Крольчатники',
    slug: 'krolchatniki',
    description: 'Крольчатники и деревянные клетки для содержания кроликов.',
    sortOrder: 2,
  },
  'universal-cage': {
    name: 'Универсальные клетки',
    slug: 'universalnye-kletki',
    description: 'Универсальные клетки и комплексы для птиц и кроликов.',
    sortOrder: 3,
  },
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const pool = new Pool({
  connectionString,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter,
});

const API_ROOT = process.cwd();
const UPLOADS_DIR = join(API_ROOT, 'uploads', 'images');

const CHICKEN_COOP_ADDITIONS: Prisma.InputJsonValue = [
  {
    id: 'coop-sawdust-bag-10kg',
    type: 'boolean',
    title: 'Мешок опилок 10 кг',
    price: 1600,
    required: false,
    defaultValue: false,
  },
  {
    id: 'coop-electricity',
    type: 'boolean',
    title: 'Электрика: патрон, лампа и выключатель',
    price: 3000,
    required: false,
    defaultValue: false,
  },
  {
    id: 'coop-drinker-feeder',
    type: 'boolean',
    title: 'Поилка / кормушка',
    price: 2500,
    required: false,
    defaultValue: false,
  },
  {
    id: 'coop-cleaning-tray-wood',
    type: 'boolean',
    title: 'Поддон для чистки, дерево',
    price: 2000,
    required: false,
    defaultValue: false,
  },
  {
    id: 'coop-cleaning-tray-metal',
    type: 'boolean',
    title: 'Поддон для чистки, металл',
    price: 3500,
    required: false,
    defaultValue: false,
  },
  {
    id: 'coop-length-plus-05m',
    type: 'boolean',
    title: 'Увеличить длину на 0,5 метра',
    price: 8000,
    required: false,
    defaultValue: false,
  },
  {
    id: 'coop-paint-two-layers',
    type: 'boolean',
    title: 'Покраска в два слоя, любой цвет на выбор',
    price: 20000,
    required: false,
    defaultValue: false,
  },
  {
    id: 'coop-installation-plates',
    type: 'quantity',
    title: 'Установочные плиты',
    price: 470,
    required: false,
    defaultValue: 0,
    min: 0,
    max: null,
    unitLabel: 'шт.',
  },
];

const EMPTY_ADDITIONS: Prisma.InputJsonValue = [];

function getProductAdditions(product: SeedProduct): Prisma.InputJsonValue {
  if (product.kind !== 'chicken-coop') return EMPTY_ADDITIONS;

  const additions = [...(CHICKEN_COOP_ADDITIONS as Prisma.InputJsonArray)];

  if (product.insulationSurcharge) {
    additions.unshift({
      id: 'coop-insulation',
      type: 'boolean',
      title: 'Утепление',
      price: product.insulationSurcharge,
      required: false,
      defaultValue: false,
    });
  }

  return additions;
}

const CYRILLIC_MAP: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'e',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'c',
  ч: 'ch',
  ш: 'sh',
  щ: 'sch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
};

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .split('')
      .map((character) => CYRILLIC_MAP[character] ?? character)
      .join('')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') || 'product'
  );
}

function getStableImageFileName(params: {
  seedKey: string;
  localPath: string;
}): string {
  const extension = extname(params.localPath).toLowerCase() || '.jpg';

  const hash = createHash('sha256')
    .update(`${params.seedKey}:${params.localPath}`)
    .digest('hex');

  const uuidLikeName = [
    hash.slice(0, 8),
    hash.slice(8, 12),
    `4${hash.slice(13, 16)}`,
    `a${hash.slice(17, 20)}`,
    hash.slice(20, 32),
  ].join('-');

  return `${uuidLikeName}${extension}`;
}

function getProductSlug(product: SeedProduct): string {
  return `${slugify(product.title)}-${product.seedKey}`;
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function prepareImages(params: {
  product: SeedProduct;
}): Promise<PreparedImage[]> {
  const preparedImages: PreparedImage[] = [];

  for (const image of [...params.product.images].sort(
    (first, second) => first.sortOrder - second.sortOrder,
  )) {
    if (image.localPath.includes('_thumb')) {
      throw new Error(
        `${params.product.seedKey}: thumbnail запрещён: ${image.localPath}`,
      );
    }

    const sourcePath = join(SEED_ASSETS_DIR, image.localPath);

    if (!(await fileExists(sourcePath))) {
      throw new Error(
        `${params.product.seedKey}: изображение не найдено: ${sourcePath}`,
      );
    }

    const fileName = getStableImageFileName({
      seedKey: params.product.seedKey,
      localPath: image.localPath,
    });

    preparedImages.push({
      sourcePath,
      fileName,
      destinationPath: join(UPLOADS_DIR, fileName),
      publicUrl: `/uploads/images/${fileName}`,
      sortOrder: image.sortOrder,
    });
  }

  if (preparedImages.length === 0) {
    throw new Error(`${params.product.seedKey}: у товара нет изображений`);
  }

  return preparedImages;
}

async function upsertCategory(params: {
  definition: CategoryDefinition;
  parentId: string | null;
}) {
  const existingCategory = await prisma.marketCategory.findFirst({
    where: {
      slug: params.definition.slug,
    },
  });

  if (existingCategory) {
    return prisma.marketCategory.update({
      where: {
        id: existingCategory.id,
      },
      data: {
        name: params.definition.name,
        slug: params.definition.slug,
        description: params.definition.description,
        sortOrder: params.definition.sortOrder,
        parentId: params.parentId,
        isActive: true,
        deletedAt: null,
      },
    });
  }

  return prisma.marketCategory.create({
    data: {
      name: params.definition.name,
      slug: params.definition.slug,
      description: params.definition.description,
      sortOrder: params.definition.sortOrder,
      parentId: params.parentId,
      isActive: true,
    },
  });
}

async function ensureCategories() {
  const rootCategory = await upsertCategory({
    definition: ROOT_CATEGORY,
    parentId: null,
  });

  const chickenCoops = await upsertCategory({
    definition: CATEGORY_DEFINITIONS['chicken-coop'],
    parentId: rootCategory.id,
  });

  const rabbitHutches = await upsertCategory({
    definition: CATEGORY_DEFINITIONS['rabbit-hutch'],
    parentId: rootCategory.id,
  });

  const universalCages = await upsertCategory({
    definition: CATEGORY_DEFINITIONS['universal-cage'],
    parentId: rootCategory.id,
  });

  return {
    rootCategory,
    categoryByKind: {
      'chicken-coop': chickenCoops,
      'rabbit-hutch': rabbitHutches,
      'universal-cage': universalCages,
    },
  };
}

async function replaceProductImages(params: {
  productId: string;
  title: string;
  images: PreparedImage[];
}) {
  const currentLinks = await prisma.productImage.findMany({
    where: {
      productId: params.productId,
    },
    select: {
      imageId: true,
      image: {
        select: {
          url: true,
        },
      },
    },
  });

  const oldLocalFiles = currentLinks
    .map((link) => link.image.url)
    .filter((url) => url.startsWith('/uploads/images/'))
    .map((url) => join(API_ROOT, url.replace(/^\//, '')));

  const oldImageIds = currentLinks.map((link) => link.imageId);

  await prisma.$transaction(async (transaction) => {
    await transaction.productImage.deleteMany({
      where: {
        productId: params.productId,
      },
    });

    if (oldImageIds.length > 0) {
      await transaction.image.deleteMany({
        where: {
          id: {
            in: oldImageIds,
          },
          userAvatars: {
            none: {},
          },
          categories: {
            none: {},
          },
          adCategories: {
            none: {},
          },
          ads: {
            none: {},
          },
          products: {
            none: {},
          },
        },
      });
    }

    for (const image of params.images) {
      const imageRecord = await transaction.image.create({
        data: {
          url: image.publicUrl,
          sortOrder: image.sortOrder,
          alt: params.title,
        },
      });

      await transaction.productImage.create({
        data: {
          productId: params.productId,
          imageId: imageRecord.id,
        },
      });
    }
  });

  const newPaths = new Set(params.images.map((image) => image.destinationPath));

  for (const oldFilePath of oldLocalFiles) {
    if (newPaths.has(oldFilePath)) {
      continue;
    }

    try {
      await unlink(oldFilePath);
    } catch {
      // Файл мог уже отсутствовать.
    }
  }
}

async function importProduct(params: {
  source: SeedProduct;
  categoryId: string;
  categoryName: string;
  kind: ProductKind;
}): Promise<ImportResult> {
  const title = params.source.title.trim();

  if (!title) {
    throw new Error(`${params.source.seedKey}: отсутствует title`);
  }

  const description = params.source.description;

  if (!description.blocks.length) {
    throw new Error(`${params.source.seedKey}: отсутствует description`);
  }

  const price = params.source.price;
  const slug = getProductSlug(params.source);

  const preparedImages = await prepareImages({
    product: params.source,
  });

  await mkdir(UPLOADS_DIR, {
    recursive: true,
  });

  for (const image of preparedImages) {
    await copyFile(image.sourcePath, image.destinationPath);
  }

  const existingProduct = await prisma.product.findFirst({
    where: {
      slug,
    },
  });

  const product = existingProduct
    ? await prisma.product.update({
        where: {
          id: existingProduct.id,
        },
        data: {
          categoryId: params.categoryId,
          title,
          slug,
          description,
          price,
          additions: getProductAdditions(params.source),
          location: params.source.location ?? Prisma.JsonNull,
          isActive: true,
          deletedAt: null,
        },
      })
    : await prisma.product.create({
        data: {
          categoryId: params.categoryId,
          title,
          slug,
          description,
          price,
          additions: getProductAdditions(params.source),
          location: params.source.location ?? Prisma.JsonNull,
          isActive: true,
        },
      });

  await replaceProductImages({
    productId: product.id,
    title,
    images: preparedImages,
  });

  return {
    seedKey: params.source.seedKey,
    title,
    slug,
    price,
    categoryName: params.categoryName,
    imagesCount: preparedImages.length,
    action: existingProduct ? 'updated' : 'created',
  };
}

async function main() {
  if (PRODUCTION_PRODUCTS.length === 0) {
    throw new Error('Во встроенных production-данных отсутствуют товары');
  }

  const countsByKind: Record<ProductKind, number> = {
    'chicken-coop': 0,
    'rabbit-hutch': 0,
    'universal-cage': 0,
  };

  PRODUCTION_PRODUCTS.forEach((product) => {
    countsByKind[product.kind] += 1;
  });

  console.log('');
  console.log('Источник: prisma/seeds/production/seed.ts');
  console.log('Всего товаров:', PRODUCTION_PRODUCTS.length);
  console.log(`Курятники: ${countsByKind['chicken-coop']}`);
  console.log(`Крольчатники: ${countsByKind['rabbit-hutch']}`);
  console.log(`Универсальные клетки: ${countsByKind['universal-cage']}`);
  console.log('Изображения:', UPLOADS_DIR);
  console.log('');

  const validationErrors: string[] = [];
  const seedKeys = new Set<string>();

  for (const product of PRODUCTION_PRODUCTS) {
    try {
      if (!product.seedKey.trim()) {
        throw new Error('отсутствует seedKey');
      }

      if (seedKeys.has(product.seedKey)) {
        throw new Error('seedKey должен быть уникальным');
      }

      seedKeys.add(product.seedKey);

      if (!product.title.trim()) {
        throw new Error('отсутствует title');
      }

      if (!product.description.blocks.length) {
        throw new Error('отсутствует description');
      }

      if (
        product.description.blocks.some((block) =>
          /Цена|Стоимость|Местоположение|₽/iu.test(block.text),
        )
      ) {
        throw new Error('description содержит цену или местоположение');
      }

      if (!Number.isSafeInteger(product.price) || product.price < 0) {
        throw new Error('price должен быть целым неотрицательным числом');
      }

      if (
        product.insulationSurcharge !== undefined &&
        (!Number.isSafeInteger(product.insulationSurcharge) ||
          product.insulationSurcharge <= 0)
      ) {
        throw new Error(
          'insulationSurcharge должен быть положительным целым числом',
        );
      }

      await prepareImages({ product });
    } catch (error) {
      validationErrors.push(
        `${product.seedKey}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  if (validationErrors.length > 0) {
    console.error('Импорт отменён. Ошибки проверки:');
    validationErrors.forEach((error) => console.error(`  - ${error}`));
    process.exitCode = 1;
    return;
  }

  console.log('Предварительная проверка пройдена.');
  console.log('');

  if (process.argv.includes('--validate-only')) {
    return;
  }

  const { rootCategory, categoryByKind } = await ensureCategories();

  const results: ImportResult[] = [];

  for (const [index, product] of PRODUCTION_PRODUCTS.entries()) {
    const category = categoryByKind[product.kind];

    const result = await importProduct({
      source: product,
      kind: product.kind,
      categoryId: category.id,
      categoryName: category.name,
    });

    results.push(result);

    console.log(
      `[${String(index + 1).padStart(2, '0')}/${PRODUCTION_PRODUCTS.length}] ` +
        `${result.action === 'created' ? 'создан' : 'обновлён'}: ` +
        `${result.title} | ` +
        `${result.price.toLocaleString('ru-RU')} ₽ | ` +
        `${result.categoryName} | ` +
        `фото: ${result.imagesCount}`,
    );
  }

  const createdCount = results.filter(
    (result) => result.action === 'created',
  ).length;

  const updatedCount = results.filter(
    (result) => result.action === 'updated',
  ).length;

  const imagesCount = results.reduce(
    (total, result) => total + result.imagesCount,
    0,
  );

  console.log('');
  console.log('Импорт завершён.');
  console.log(`Создано товаров: ${createdCount}`);
  console.log(`Обновлено товаров: ${updatedCount}`);
  console.log(`Обработано изображений: ${imagesCount}`);
  console.log(`Корневая категория: ${rootCategory.name}`);

  console.log('');
  console.log('Распределение:');

  for (const kind of [
    'chicken-coop',
    'rabbit-hutch',
    'universal-cage',
  ] as ProductKind[]) {
    const category = categoryByKind[kind];

    console.log(`  ${category.name}: ${countsByKind[kind]}`);
  }
}

main()
  .catch((error) => {
    console.error('');
    console.error('Ошибка production-импорта:');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
