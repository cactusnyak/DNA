import { useQuery } from '@tanstack/react-query';

import {
  getCurrentUser,
  useAuthStore,
} from '@/entities/auth';
import { BalanceHero } from '@/widgets/BalanceHero';
import { LatestProducts } from '@/widgets/LatestProducts/LatestProducts';
import { LatestAds } from '@/widgets/LatestAds/LatestAds';

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

      {/* Latest Products Section */}
      <LatestProducts
        initialChunkSize={8}
        chunkSize={4}
        className="px-4 md:px-6 lg:px-8"
      />

      {/* Latest Ads Section */}
      <LatestAds
        initialChunkSize={8}
        chunkSize={4}
        className="px-4 md:px-6 lg:px-8"
      />
    </div>
  );
}
