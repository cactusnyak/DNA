import type { ReferralTreeUser } from '@/entities/referral';
import type { User } from '@/entities/user';
import { BalanceCard } from '@/widgets/BalanceCard';

import { ReferralLinkCard } from '../ReferralLinkCard';
import { ReferralTree } from '../ReferralTree';

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
  return (
    <div className="space-y-6">
      <BalanceCard balance={user.balance} />

      <ReferralLinkCard user={user} />

      <ReferralTree
        users={referralTree}
        isPending={isTreePending}
        isError={isTreeError}
      />
    </div>
  );
}