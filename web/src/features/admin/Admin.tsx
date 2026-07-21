import { useQuery } from '@tanstack/react-query';

import { getAdminOverview } from '@/entities/admin';
import {
  getCurrentUser,
  useAuthStore,
} from '@/entities/auth';
import { StateCard } from '@/components/ui/StateCard';

import { AdminDashboard } from './components/AdminDashboard';

export function Admin() {
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

  const isAdmin = user?.role === 'ADMIN';

  const {
    data: overview,
    isPending: isOverviewPending,
    isError: isOverviewError,
  } = useQuery({
    queryKey: ['admin-overview', accessToken],
    queryFn: () => getAdminOverview(accessToken ?? ''),
    enabled: Boolean(accessToken) && isAdmin,
  });

  if (!accessToken) {
    return (
      <StateCard
        title="Админка недоступна"
        description="Войдите в аккаунт администратора, чтобы управлять каталогом и заказами."
        action={{
          label: 'Войти',
          to: '/authorization',
        }}
      />
    );
  }

  if (isUserPending) {
    return (
      <p className="text-sm text-muted-foreground">
        Проверяем права доступа...
      </p>
    );
  }

  if (isUserError || !user) {
    return (
      <StateCard
        title="Сессия недоступна"
        description="Не удалось получить данные пользователя. Возможно, токен устарел."
        action={{
          label: 'Выйти из профиля',
          onClick: clearAccessToken,
        }}
      />
    );
  }

  if (!isAdmin) {
    return (
      <StateCard
        title="Нет доступа"
        description="Эта страница доступна только администраторам. Обычным пользователям сюда нельзя, даже если очень уверенно ввести URL руками."
        action={{
          label: 'Вернуться в профиль',
          to: '/profile',
          variant: 'outline',
        }}
      />
    );
  }

  return (
    <AdminDashboard
      accessToken={accessToken}
      overview={overview}
      isOverviewPending={isOverviewPending}
      isOverviewError={isOverviewError}
    />
  );
}
