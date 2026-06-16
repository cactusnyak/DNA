import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/Section';
import {
  getCurrentUser,
  useAuthStore,
} from '@/entities/auth';
import { getReferralTree } from '@/entities/referral';

import { ReferralDashboard } from './components/ReferralDashboard';
import { ReferralGuestLanding } from './components/ReferralGuestLanding';

export function Referrals() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const clearAccessToken = useAuthStore((state) => state.clearAccessToken);

  const {
    data: user,
    isPending: isUserPending,
    isError: isUserError,
  } = useQuery({
    queryKey: ['current-user'],
    queryFn: getCurrentUser,
    enabled: Boolean(accessToken),
  });

  const {
    data: referralTree = [],
    isPending: isReferralTreePending,
    isError: isReferralTreeError,
  } = useQuery({
    queryKey: ['referral-tree', accessToken],
    queryFn: () => getReferralTree(accessToken ?? ''),
    enabled: Boolean(accessToken),
  });

  if (!accessToken) {
    return <ReferralGuestLanding />;
  }

  if (isUserPending) {
    return <p className="text-muted-foreground">Загрузка раздела заработка...</p>;
  }

  if (isUserError || !user) {
    return (
      <section className="rounded-3xl border border-border bg-card p-6">
        <h1 className="text-2xl font-semibold">Сессия устала жить</h1>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Не удалось загрузить пользователя. Выйдите и войдите снова, чтобы
          раздел заработка снова вспомнил, кто вы такой.
        </p>

        <Button
          type="button"
          variant="outline"
          className="mt-5"
          onClick={clearAccessToken}
        >
          Выйти
        </Button>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Заработок"
        description="Реферальная ссылка, баланс и дерево приглашённых пользователей."
      />

      <ReferralDashboard
        user={user}
        referralTree={referralTree}
        isTreePending={isReferralTreePending}
        isTreeError={isReferralTreeError}
      />
    </div>
  );
}