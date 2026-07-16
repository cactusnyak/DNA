import { useQuery } from '@tanstack/react-query';

import {
  getCurrentUser,
  useAuthStore,
} from '@/entities/auth';
import { BalanceHero } from '@/widgets/BalanceHero';
import { CombinedFeed } from '@/widgets/CombinedFeed';

export function HomePage() {
  const accessToken = useAuthStore((state) => state.accessToken);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: getCurrentUser,
    enabled: Boolean(accessToken),
  });

  return (
    <div className="space-y-10">
      <BalanceHero
        balance={user?.balance}
        isAuthenticated={Boolean(user)}
        showReferralLink
        guestText="Покупать можно без регистрации. Профиль откроет баланс, кешбэк, историю заказов и реферальную систему."
      />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Товары и объявления</h2>
        <CombinedFeed />
      </section>
    </div>
  );
}
