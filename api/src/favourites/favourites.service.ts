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
    return this.prismaService.favourite.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: {
              include: { image: true },
            },
          },
        },
        ad: {
          include: {
            images: {
              include: { image: true },
            },
            seller: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
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
