import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async updateUserRole(id: string, body: unknown) {
    await this.getUserOrThrow(id);
    const payload = this.getObjectBody(body);

    if (
      typeof payload.role !== 'string' ||
      !Object.values(UserRole).includes(payload.role as UserRole)
    ) {
      throw new BadRequestException('Invalid user role');
    }

    await this.prismaService.user.update({
      where: { id },
      data: { role: payload.role as UserRole },
    });

    return this.getAdminUserById(id);
  }

  async deleteUser(id: string) {
    await this.getUserOrThrow(id);
    await this.usersService.softDeleteById(id);

    return this.getAdminUserById(id);
  }

  async hardDeleteUser(id: string) {
    await this.prismaService.$transaction(async (tx) => {
      const adIds = (
        await tx.ad.findMany({ where: { sellerId: id }, select: { id: true } })
      ).map((ad) => ad.id);
      const referralIds = (
        await tx.referral.findMany({
          where: { OR: [{ inviterUserId: id }, { invitedUserId: id }] },
          select: { id: true },
        })
      ).map((referral) => referral.id);

      await tx.referralReward.deleteMany({ where: { referralId: { in: referralIds } } });
      await tx.referral.deleteMany({ where: { id: { in: referralIds } } });
      await tx.cartItem.deleteMany({ where: { OR: [{ userId: id }, { adId: { in: adIds } }] } });
      await tx.favourite.deleteMany({ where: { OR: [{ userId: id }, { adId: { in: adIds } }] } });
      await tx.adImage.deleteMany({ where: { adId: { in: adIds } } });
      await tx.ad.deleteMany({ where: { sellerId: id } });
      await tx.balance.deleteMany({ where: { userId: id } });
      await tx.user.delete({ where: { id } });
    });

    return { deleted: 1 };
  }

  async bulkDeleteUsers(body: unknown) {
    const ids = this.getIdsFromBody(body);
    await Promise.all(ids.map((id) => this.usersService.softDeleteById(id)));

    return { deleted: ids.length };
  }

  async bulkHardDeleteUsers(body: unknown) {
    const ids = this.getIdsFromBody(body);

    await this.prismaService.$transaction(async (tx) => {
      const adIds = (
        await tx.ad.findMany({
          where: { sellerId: { in: ids } },
          select: { id: true },
        })
      ).map((ad) => ad.id);
      const referralIds = (
        await tx.referral.findMany({
          where: {
            OR: [
              { inviterUserId: { in: ids } },
              { invitedUserId: { in: ids } },
            ],
          },
          select: { id: true },
        })
      ).map((referral) => referral.id);

      await tx.referralReward.deleteMany({ where: { referralId: { in: referralIds } } });
      await tx.referral.deleteMany({ where: { id: { in: referralIds } } });
      await tx.cartItem.deleteMany({ where: { OR: [{ userId: { in: ids } }, { adId: { in: adIds } }] } });
      await tx.favourite.deleteMany({ where: { OR: [{ userId: { in: ids } }, { adId: { in: adIds } }] } });
      await tx.adImage.deleteMany({ where: { adId: { in: adIds } } });
      await tx.ad.deleteMany({ where: { sellerId: { in: ids } } });
      await tx.balance.deleteMany({ where: { userId: { in: ids } } });
      await tx.user.deleteMany({ where: { id: { in: ids } } });
    });

    return { deleted: ids.length };
  }

  private getObjectBody(body: unknown) {
    return body && typeof body === 'object'
      ? (body as Record<string, unknown>)
      : {};
  }

  private getIdsFromBody(body: unknown): string[] {
    const payload = this.getObjectBody(body);

    if (!Array.isArray(payload.ids)) {
      throw new BadRequestException('ids must be an array of strings');
    }

    const ids = payload.ids.filter((id) => typeof id === 'string' && id.trim());

    if (!ids.length) {
      throw new BadRequestException('ids array must not be empty');
    }

    return ids as string[];
  }

  private async getUserOrThrow(id: string) {
    const user = await this.prismaService.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private async getAdminUserById(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      include: {
        avatar: true,
        _count: { select: { ads: true, orders: true } },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      nicknameSuffix: user.nicknameSuffix,
      firstName: user.firstName ?? undefined,
      lastName: user.lastName ?? undefined,
      patronymic: user.patronymic ?? undefined,
      role: user.role,
      phone: user.phone ?? undefined,
      referralCode: user.referralCode ?? undefined,
      avatar: user.avatar ?? undefined,
      isActive: user.deletedAt === null,
      deletedAt: user.deletedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      adsCount: user._count.ads,
      ordersCount: user._count.orders,
    };
  }
}
