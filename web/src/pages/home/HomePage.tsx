import { useQuery } from '@tanstack/react-query';

import {
  getCurrentUser,
  useAuthStore,
} from '@/entities/auth';
import { BalanceHero } from '@/widgets/BalanceHero';
import { CombinedFeed } from '@/widgets/CombinedFeed';
import { SectionHeader } from '@/components/ui/Section';
import { ContentCard } from '@/components/ui/ContentCard';

export function HomePage() {
  const accessToken = useAuthStore((state) => state.accessToken);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: getCurrentUser,
    enabled: Boolean(accessToken),
  });

  return (
    <div className="space-y-8">
      <BalanceHero
        balance={user?.balance}
        isAuthenticated={Boolean(user)}
        showReferralLink
        title={user ? 'Баланс' : 'Возможности профиля'}
        guestText="Заказ в Маркете можно оформить без регистрации. В профиле доступны история заказов, реферальный код и дерево приглашений. Финансовые функции пока разрабатываются."
      />

      <ContentCard as="section">
        <SectionHeader
          title="Товары и объявления"
          description="Предложения из обоих разделов: товаров и объявлений."
        />
        <CombinedFeed />
      </ContentCard>
    </div>
  );
}
