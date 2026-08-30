import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

type ReferralWithInvitedUser = {
  inviterUserId: string;
  invitedUserId: string;
  createdAt: Date;
  invited: {
    id: string;
    nickname: string;
    nicknameSuffix: string;
    referralCode: string | null;
    deletedAt: Date | null;
  };
};

@Injectable()
export class ReferralsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getReferralTree(userId: string) {
    const [referrals, levels] = await Promise.all([
      this.prismaService.referral.findMany({
        include: {
          invited: {
            select: {
              id: true,
              nickname: true,
              nicknameSuffix: true,
              referralCode: true,
              deletedAt: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prismaService.rewardProgramLevel.findMany({
        where: { isActive: true },
        orderBy: { depth: 'asc' },
      }),
    ]);
    const maxDepth = Math.max(0, ...levels.map((level) => level.depth));

    const referralsByInviterUserId =
      this.groupReferralsByInviterUserId(referrals);

    return this.buildReferralTree({
      inviterUserId: userId,
      referralsByInviterUserId,
      level: 1,
      visitedUserIds: new Set([userId]),
      maxDepth,
    });
  }

  private groupReferralsByInviterUserId(referrals: ReferralWithInvitedUser[]) {
    const referralsByInviterUserId = new Map<
      string,
      ReferralWithInvitedUser[]
    >();

    referrals.forEach((referral) => {
      const currentReferrals =
        referralsByInviterUserId.get(referral.inviterUserId) ?? [];

      referralsByInviterUserId.set(referral.inviterUserId, [
        ...currentReferrals,
        referral,
      ]);
    });

    return referralsByInviterUserId;
  }

  private buildReferralTree(params: {
    inviterUserId: string;
    referralsByInviterUserId: Map<string, ReferralWithInvitedUser[]>;
    level: number;
    visitedUserIds: Set<string>;
    maxDepth: number;
  }): unknown[] {
    const {
      inviterUserId,
      referralsByInviterUserId,
      level,
      visitedUserIds,
      maxDepth,
    } = params;

    if (level > maxDepth) {
      return [];
    }

    const referrals = referralsByInviterUserId.get(inviterUserId) ?? [];

    return referrals
      .filter((referral) => !visitedUserIds.has(referral.invitedUserId))
      .map((referral) => {
        const nextVisitedUserIds = new Set(visitedUserIds);
        const isInvitedUserDeleted = Boolean(referral.invited.deletedAt);

        nextVisitedUserIds.add(referral.invitedUserId);

        return {
          id: referral.invited.id,
          nickname: isInvitedUserDeleted
            ? 'Удалённый пользователь'
            : referral.invited.nickname,
          nicknameSuffix: isInvitedUserDeleted
            ? undefined
            : referral.invited.nicknameSuffix,
          referralCode: isInvitedUserDeleted
            ? undefined
            : (referral.invited.referralCode ?? undefined),
          level,
          invitedAt: referral.createdAt,
          children: this.buildReferralTree({
            inviterUserId: referral.invitedUserId,
            referralsByInviterUserId,
            level: level + 1,
            visitedUserIds: nextVisitedUserIds,
            maxDepth,
          }),
        };
      });
  }
}
