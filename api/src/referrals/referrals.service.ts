import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

const REFERRAL_TREE_MAX_DEPTH = 4;

type ReferralWithInvitedUser = {
  inviterUserId: string;
  invitedUserId: string;
  createdAt: Date;
  invited: {
    id: string;
    firstName: string;
    lastName: string;
    referralCode: string | null;
  };
};

@Injectable()
export class ReferralsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getReferralTree(userId: string) {
    const referrals = await this.prismaService.referral.findMany({
      include: {
        invited: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            referralCode: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const referralsByInviterUserId = this.groupReferralsByInviterUserId(
      referrals,
    );

    return this.buildReferralTree({
      inviterUserId: userId,
      referralsByInviterUserId,
      level: 1,
      visitedUserIds: new Set([userId]),
    });
  }

  private groupReferralsByInviterUserId(
    referrals: ReferralWithInvitedUser[],
  ) {
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
  }): unknown[] {
    const {
      inviterUserId,
      referralsByInviterUserId,
      level,
      visitedUserIds,
    } = params;

    if (level > REFERRAL_TREE_MAX_DEPTH) {
      return [];
    }

    const referrals = referralsByInviterUserId.get(inviterUserId) ?? [];

    return referrals
      .filter((referral) => !visitedUserIds.has(referral.invitedUserId))
      .map((referral) => {
        const nextVisitedUserIds = new Set(visitedUserIds);

        nextVisitedUserIds.add(referral.invitedUserId);

        return {
          id: referral.invited.id,
          firstName: referral.invited.firstName,
          lastName: referral.invited.lastName,
          referralCode: referral.invited.referralCode ?? undefined,
          level,
          invitedAt: referral.createdAt,
          children: this.buildReferralTree({
            inviterUserId: referral.invitedUserId,
            referralsByInviterUserId,
            level: level + 1,
            visitedUserIds: nextVisitedUserIds,
          }),
        };
      });
  }
}