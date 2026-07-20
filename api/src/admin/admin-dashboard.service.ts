import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prismaService: PrismaService) {}

  async getOverview() {
    const [
      usersCount,
      marketCategoriesCount,
      productsCount,
      collectionsCount,
      ordersCount,
      adCategoriesCount,
      adsCount,
    ] = await this.prismaService.$transaction([
      this.prismaService.user.count({ where: { deletedAt: null } }),
      this.prismaService.marketCategory.count({ where: { deletedAt: null } }),
      this.prismaService.product.count({ where: { deletedAt: null } }),
      this.prismaService.catalogCollection.count(),
      this.prismaService.order.count(),
      this.prismaService.adCategory.count({ where: { deletedAt: null } }),
      this.prismaService.ad.count({ where: { deletedAt: null } }),
    ]);

    return {
      usersCount,
      marketCategoriesCount,
      productsCount,
      collectionsCount,
      ordersCount,
      adCategoriesCount,
      adsCount,
    };
  }

  async getReferrals(): Promise<object[]> {
    const users = await this.prismaService.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        nickname: true,
        nicknameSuffix: true,
        email: true,
        phone: true,
        role: true,
        referralCode: true,
        createdAt: true,
        receivedReferral: { select: { inviterUserId: true } },
        invitedReferrals: {
          select: {
            createdAt: true,
            invited: {
              select: {
                id: true,
                nickname: true,
                nicknameSuffix: true,
                email: true,
                deletedAt: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    type FlatUser = (typeof users)[number];
    type TreeNode = {
      id: string;
      nickname: string;
      nicknameSuffix?: string;
      email: string | null;
      phone: string | null;
      role: string;
      referralCode: string | null;
      createdAt: Date;
      deletedAt: null;
      invitedBy: string | null;
      directReferralsCount: number;
      directReferrals: TreeNode[];
    };

    const byId = new Map<string, FlatUser>(users.map((user) => [user.id, user]));

    function buildNode(
      user: FlatUser,
      inviterChain: string | null,
      visited: Set<string>,
    ): TreeNode {
      const children = user.invitedReferrals
        .filter((referral) => !visited.has(referral.invited.id))
        .map((referral) => {
          const childUser = byId.get(referral.invited.id);

          if (!childUser) {
            return null;
          }

          const nextVisited = new Set(visited);
          nextVisited.add(referral.invited.id);

          return buildNode(
            childUser,
            inviterChain
              ? `${inviterChain} → ${user.nickname}`.trim()
              : user.nickname.trim() || user.email || user.phone,
            nextVisited,
          );
        })
        .filter((node): node is TreeNode => node !== null);

      return {
        id: user.id,
        nickname: user.nickname,
        nicknameSuffix: user.nicknameSuffix,
        email: user.email,
        phone: user.phone,
        role: user.role,
        referralCode: user.referralCode,
        createdAt: user.createdAt,
        deletedAt: null,
        invitedBy: inviterChain,
        directReferralsCount: children.length,
        directReferrals: children,
      };
    }

    return users
      .filter((user) => !user.receivedReferral)
      .map((user) => buildNode(user, null, new Set([user.id])));
  }
}
