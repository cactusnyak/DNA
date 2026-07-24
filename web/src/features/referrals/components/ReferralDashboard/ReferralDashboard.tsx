import { useState } from 'react';

import type { ReferralTreeUser } from '@/entities/referral';
import type { User } from '@/entities/user';
import { BalanceCard } from '@/widgets/BalanceCard';

import { ReferralCodeCard } from '../ReferralCodeCard';
import { ReferralEarningCategories } from '../ReferralEarningCategories';
import { ReferralEarningDescription } from '../ReferralEarningDescription';
import { ReferralLinkCard } from '../ReferralLinkCard';
import { ReferralTree } from '../ReferralTree';

import type { ReferralEarningCategoryId } from '../../types/referral-earning-category';

type ReferralDashboardProps = {
  user: User;
  referralTree: ReferralTreeUser[];
  isTreePending?: boolean;
  isTreeError?: boolean;
};

export function ReferralDashboard({
  user,
  referralTree,
  isTreePending = false,
  isTreeError = false,
}: ReferralDashboardProps) {
  const [activeEarningCategoryId, setActiveEarningCategoryId] =
    useState<ReferralEarningCategoryId>('personal-cashback');

  return (
    <div className="space-y-10">
      <div className="grid gap-4 md:grid-cols-[minmax(min-content,3fr)_minmax(0,7fr)] md:items-stretch">
        <div className="grid gap-4">
          <BalanceCard balance={user.balance} />

          <ReferralCodeCard user={user} />
        </div>

        <div className="grid gap-4">
          <ReferralLinkCard user={user} />

          <ReferralEarningCategories
            activeCategoryId={activeEarningCategoryId}
            onActiveCategoryChange={setActiveEarningCategoryId}
          />
        </div>
      </div>

      <ReferralEarningDescription activeCategoryId={activeEarningCategoryId} />

      <ReferralTree
        users={referralTree}
        isPending={isTreePending}
        isError={isTreeError}
      />
    </div>
  );
}
