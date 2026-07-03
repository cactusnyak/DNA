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
      <BalanceHero
        balance={user?.balance}
        isAuthenticated={Boolean(user)}
        showReferralLink
        guestText="Покупать можно без регистрации. Профиль откроет баланс, кешбэк, историю заказов и реферальную систему."
      />

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <SectionHeader
            title="Маркет"
            description="Товары DNA и будущие предложения продавцов. Тут живёт магазинная часть платформы."
          />

          <Button asChild className="mt-5">
            <Link to="/market/catalog">Открыть каталог маркета</Link>
          </Button>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <SectionHeader
            title="Доска"
            description="Будущий раздел объявлений пользователей: категории уже отделены, карточки объявлений подключим позже."
          />

          <Button asChild className="mt-5">
            <Link to="/ads/catalog">Открыть каталог доски</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
