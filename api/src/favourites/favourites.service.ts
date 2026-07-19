import { BadRequestException, Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

type AddFavouriteParams = {
  userId: string;
  productId?: string;
  adId?: string;
};

@Injectable()
export class FavouritesService {
  constructor(private readonly prismaService: PrismaService) {}

  async getFavourites(userId: string) {
    const rows = await this.prismaService.favourite.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            category: true,
            images: {
              include: { image: true },
              orderBy: { image: { sortOrder: 'asc' } },
            },
          },
        },
        ad: {
          include: {
            category: true,
            images: {
              include: { image: true },
              orderBy: { image: { sortOrder: 'asc' } },
            },
            seller: {
              select: {
                id: true,
                nickname: true,
                nicknameSuffix: true,
                phone: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return rows.map((fav) => ({
      ...fav,
      product: fav.product
        ? {
            ...fav.product,
            images: fav.product.images.map((pi: any) => pi.image),
          }
        : null,
      ad: fav.ad
        ? {
            ...fav.ad,
            images: fav.ad.images.map((ai: any) => ai.image),
          }
        : null,
    }));
  }

  async addFavourite(params: AddFavouriteParams) {
    const { userId, productId, adId } = params;

    if (!productId && !adId) {
      throw new BadRequestException('productId or adId is required');
    }

    if (productId && adId) {
      throw new BadRequestException('Provide either productId or adId, not both');
    }

    return this.prismaService.favourite.create({
      data: { userId, productId, adId },
    });
  }

  async removeFavourite(params: { userId: string; productId?: string; adId?: string }) {
    const { userId, productId, adId } = params;

    if (!productId && !adId) {
      throw new BadRequestException('productId or adId is required');
    }

    const where = productId
      ? { userId_productId: { userId, productId } }
      : { userId_adId: { userId, adId: adId! } };

    await this.prismaService.favourite.delete({ where });
  }
}
