import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';

import { MarketCategoriesService } from './market-categories.service';

describe('MarketCategoriesService', () => {
  let service: MarketCategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarketCategoriesService,
        {
          provide: PrismaService,
          useValue: {
            marketCategory: {
              findMany: jest.fn().mockResolvedValue([]),
            },
          },
        },
      ],
    }).compile();

    service = module.get<MarketCategoriesService>(MarketCategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
