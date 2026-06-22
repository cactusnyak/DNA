import { useMutation, useQuery } from '@tanstack/react-query';

import { SectionHeader } from '@/components/ui/Section';
import {
  getCurrentUser,
  useAuthStore,
} from '@/entities/auth';
import { getMyOrders } from '@/entities/order';
import { deleteCurrentUser } from '@/entities/user';

import { ProfileDangerZone } from './components/ProfileDangerZone';
import { ProfileDetailsCard } from './components/ProfileDetailsCard';
import { ProfileOrdersCard } from './components/ProfileOrdersCard';
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

  const {
    data: orders = [],
    isPending: isOrdersPending,
    isError: isOrdersError,
  } = useQuery({
    queryKey: ['my-orders', accessToken],
    queryFn: () => getMyOrders(accessToken ?? ''),
    enabled: Boolean(accessToken),
  });

  const deleteAccountMutation = useMutation({
    mutationFn: () => deleteCurrentUser(accessToken ?? ''),
    onSuccess: () => {
      clearAccessToken();
    },
  });

  function handleDeleteAccount() {
    const isConfirmed = window.confirm(
      'Удалить аккаунт? Это действие нельзя будет отменить.',
    );

    if (!isConfirmed) {
      return;
    }

    deleteAccountMutation.mutate();
  }

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
        description="Личные данные, баланс и история заказов."
      />

      <ProfileDetailsCard user={user} />

      <ProfileOrdersCard
        orders={orders}
        isPending={isOrdersPending}
        isError={isOrdersError}
      />

      {deleteAccountMutation.isError && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Не удалось удалить аккаунт. Проверьте, что backend поддерживает
          DELETE /users/me.
        </p>
      )}

      <ProfileDangerZone
        isDeletePending={deleteAccountMutation.isPending}
        onLogout={clearAccessToken}
        onDeleteAccount={handleDeleteAccount}
      />
    </div>
  );
}