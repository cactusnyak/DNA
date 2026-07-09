import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import {
  getCurrentUser,
  useAuthStore,
} from '@/entities/auth';
import { Button } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/Section';
import { PLATFORM_SECTION } from '@/shared/platform';
import { BalanceHero } from '@/widgets/BalanceHero';
import { Catalog } from '@/widgets/Catalog';

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
    </div>
  );
}
