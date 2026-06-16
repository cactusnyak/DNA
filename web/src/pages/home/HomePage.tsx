import { useQuery } from '@tanstack/react-query';

import {
  getCurrentUser,
  useAuthStore,
} from '@/entities/auth';
import { BalanceOverview } from '@/widgets/BalanceOverview';
import { Catalog } from '@/widgets/Catalog';
import { CategoryPreview } from '@/widgets/CategoryPreview';

export function HomePage() {
  const accessToken = useAuthStore((state) => state.accessToken);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: getCurrentUser,
    enabled: Boolean(accessToken),
  });

  return (
    <div className="space-y-10">
      <BalanceOverview
        balance={user?.balance}
        isAuthenticated={Boolean(user)}
        showReferralLink
        guestText="Покупать можно без регистрации, но профиль откроет баланс, кешбэк, историю заказов и реферальную систему. То есть деньги и порядок, две вещи, которые человечество обычно теряет первыми."
      />

      <CategoryPreview />

      <Catalog
        title="Популярные товары"
        showHeader
        showCatalogLink
        showControls={false}
      />
    </div>
  );
}