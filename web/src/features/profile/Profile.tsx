import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { SectionHeader } from '@/components/ui/Section';
import { ContentCard } from '@/components/ui/ContentCard';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import {
  getCurrentUser,
  useAuthStore,
} from '@/entities/auth';
import { getMyOrders } from '@/entities/order';
import {
  deleteCurrentUser,
  updateCurrentUser,
  uploadUserAvatar,
} from '@/entities/user';

import { AvatarCropModal } from './components/AvatarCropModal';
import { ProfileDangerZone } from './components/ProfileDangerZone';
import { ProfileDetailsCard } from './components/ProfileDetailsCard';
import { ProfileEditModal } from './components/ProfileEditModal/ProfileEditModal';
import { ProfileOrdersCard } from './components/ProfileOrdersCard';
import { ProfileSessionErrorState } from './components/ProfileSessionErrorState';
import { ProfileUnauthorizedState } from './components/ProfileUnauthorizedState';

export function Profile() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const clearAccessToken = useAuthStore((state) => state.clearAccessToken);
  const queryClient = useQueryClient();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [avatarFileToCrop, setAvatarFileToCrop] = useState<File>();

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

  const updateProfileMutation = useMutation({
    mutationFn: (value: {
      nickname: string;
      firstName: string;
      lastName: string;
      patronymic: string;
      phone?: string;
    }) =>
      updateCurrentUser(accessToken ?? '', {
        nickname: value.nickname,
        firstName: value.firstName || undefined,
        lastName: value.lastName || undefined,
        patronymic: value.patronymic || undefined,
        phone: value.phone || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      setIsEditModalOpen(false);
    },
  });

  const updateAvatarMutation = useMutation({
    mutationFn: async (value: { avatarFile?: File; remove: boolean }) => {
      let avatarId: string | null | undefined;

      if (value.remove) {
        avatarId = null;
      } else if (value.avatarFile) {
        const uploadedAvatar = await uploadUserAvatar(
          accessToken ?? '',
          value.avatarFile,
        );
        avatarId = uploadedAvatar.id;
      }

      return updateCurrentUser(accessToken ?? '', {
        avatarId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: () => deleteCurrentUser(accessToken ?? ''),
    onSuccess: () => {
      clearAccessToken();
    },
  });

  function handleDeleteAccount() {
    const isConfirmed = window.confirm(
      'Удалить аккаунт? Вход станет недоступен, а персональные данные будут обезличены.',
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
    return (
      <SkeletonLoader
        layout="stack"
        count={3}
        itemClassName="min-h-40"
        ariaLabel="Загружаем профиль"
      />
    );
  }

  if (error || !user) {
    return <ProfileSessionErrorState onLogout={clearAccessToken} />;
  }

  return (
    <ContentCard>
      <SectionHeader
        title="Профиль"
        description="Личные данные, баланс и история заказов."
      />

      <ProfileDetailsCard
        user={user}
        isAvatarPending={updateAvatarMutation.isPending}
        onEdit={() => setIsEditModalOpen(true)}
        onAvatarSelect={setAvatarFileToCrop}
        onRemoveAvatar={() =>
          updateAvatarMutation.mutate({ remove: true })
        }
      />

      <ProfileOrdersCard
        orders={orders}
        isPending={isOrdersPending}
        isError={isOrdersError}
      />

      <ProfileEditModal
        user={user}
        isOpen={isEditModalOpen}
        isPending={updateProfileMutation.isPending}
        error={updateProfileMutation.error}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={(value) => updateProfileMutation.mutate(value)}
      />

      {avatarFileToCrop && (
        <AvatarCropModal
          key={`${avatarFileToCrop.name}-${avatarFileToCrop.lastModified}`}
          file={avatarFileToCrop}
          onClose={() => setAvatarFileToCrop(undefined)}
          onConfirm={(avatarFile) => {
            setAvatarFileToCrop(undefined);
            updateAvatarMutation.mutate({ avatarFile, remove: false });
          }}
        />
      )}

      {updateProfileMutation.isError && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Не удалось сохранить изменения. Попробуйте ещё раз.
        </p>
      )}

      {updateAvatarMutation.isError && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Не удалось обновить аватар. Попробуйте ещё раз.
        </p>
      )}

      {deleteAccountMutation.isError && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Не удалось удалить аккаунт. Попробуйте ещё раз.
        </p>
      )}

      <ProfileDangerZone
        isDeletePending={deleteAccountMutation.isPending}
        onLogout={clearAccessToken}
        onDeleteAccount={handleDeleteAccount}
      />
    </ContentCard>
  );
}
