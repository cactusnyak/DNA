import { useQuery } from '@tanstack/react-query';

import { SectionHeader } from '@/components/ui/Section';
import {
  getCurrentUser,
  useAuthStore,
} from '@/entities/auth';

import { ProfileBalanceCard } from './components/ProfileBalanceCard';
import { ProfileDetailsCard } from './components/ProfileDetailsCard';
import { ProfileSessionErrorState } from './components/ProfileSessionErrorState';
import { ProfileUnauthorizedState } from './components/ProfileUnauthorizedState';

export function Profile() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const clearAccessToken = useAuthStore((state) => state.clearAccessToken);

  const {
    data: user,
    isPending,
    error,
  } = useQuery({
    queryKey: ['current-user'],
    queryFn: getCurrentUser,
    enabled: Boolean(accessToken),
  });

  if (!accessToken) {
    return <ProfileUnauthorizedState />;
  }

  if (isPending) {
    return <p className="text-muted-foreground">Загрузка профиля...</p>;
  }

  if (error || !user) {
    return <ProfileSessionErrorState onLogout={clearAccessToken} />;
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Профиль"
        description="Личные данные, баланс и будущая история заказов."
      />

      <section className="grid gap-4 md:grid-cols-[minmax(0,1fr)_320px]">
        <ProfileDetailsCard user={user} />

        <ProfileBalanceCard user={user} onLogout={clearAccessToken} />
      </section>
    </div>
  );
}