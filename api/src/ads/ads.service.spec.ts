import { BadRequestException } from '@nestjs/common';
import { AdStatus } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { AdsService } from './ads.service';

describe('AdsService safeguards', () => {
  const category = {
    id: 'category-1',
    name: 'Category',
    slug: 'category',
    sortOrder: 1,
    description: null,
    parentId: null,
    image: null,
  };

  function createService() {
    const prisma = {
      adCategory: {
        findFirst: jest.fn().mockResolvedValue(category),
        findMany: jest.fn().mockResolvedValue([category]),
      },
      ad: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      $transaction: jest.fn(),
    };
    const moderation = {
      moderateOnCreate: jest.fn(),
      moderateOnUpdate: jest.fn(),
    };
    return {
      prisma,
      service: new AdsService(prisma as unknown as PrismaService, moderation),
    };
  }

  it.each([-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, 'free'])(
    'rejects invalid price %p',
    async (price) => {
      const { service, prisma } = createService();

      await expect(
        service.create('seller-1', {
          title: 'Valid title',
          categoryId: category.id,
          price,
          contactEmail: 'seller@example.com',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    },
  );

  it('rejects an ad without published contacts', async () => {
    const { service, prisma } = createService();

    await expect(
      service.create('seller-1', {
        title: 'Valid title',
        categoryId: category.id,
        price: 100,
      }),
    ).rejects.toThrow('At least one ad contact is required');
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('rejects an invalid contact email', async () => {
    const { service } = createService();

    await expect(
      service.create('seller-1', {
        title: 'Valid title',
        categoryId: category.id,
        price: 100,
        contactEmail: 'not-an-email',
      }),
    ).rejects.toThrow('Ad contact email is invalid');
  });

  it('loads an owned non-public ad without the public status filter', async () => {
    const { service, prisma } = createService();
    prisma.ad.findFirst.mockResolvedValue({
      id: 'ad-1',
      categoryId: category.id,
      sellerId: 'seller-1',
      title: 'Pending ad',
      slug: 'pending-ad',
      description: [],
      price: 100,
      location: null,
      status: AdStatus.PENDING_MODERATION,
      moderatedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      contactEmail: 'seller@example.com',
      contactPhone: null,
      contactTelegram: null,
      contactOther: null,
      category,
      seller: { id: 'seller-1', nickname: 'seller', nicknameSuffix: 1 },
      images: [],
    });

    const result = await service.findOwnedById('ad-1', 'seller-1');

    expect(result.status).toBe(AdStatus.PENDING_MODERATION);
    expect(prisma.ad.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'ad-1', sellerId: 'seller-1', deletedAt: null },
      }),
    );
  });
});
