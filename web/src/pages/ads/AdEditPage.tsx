import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';

import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { SectionHeader } from '@/components/ui/Section';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import {
  getMyAd,
  updateAd,
  uploadAdImage,
  type UpdateAdPayload,
} from '@/entities/ad';
import { useAuthStore } from '@/entities/auth';
import { AdForm } from '@/widgets/AdForm';
import { StateCard } from '@/components/ui/StateCard';

export function AdEditPage() {
  const { adId } = useParams();
  const accessToken = useAuthStore((state) => state.accessToken);
  const navigate = useNavigate();

  const {
    data: ad,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['ad', adId],
    queryFn: () => getMyAd(accessToken ?? '', adId ?? ''),
    enabled: Boolean(accessToken && adId),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateAdPayload) =>
      updateAd(accessToken ?? '', adId ?? '', payload),
    onSuccess: () => {
      navigate('/ads/my');
    },
  });

  if (!accessToken) {
    return (
      <StateCard
        title="Редактирование недоступно"
        description="Войдите в аккаунт, чтобы редактировать объявление."
        action={{
          label: 'Войти',
          to: '/authorization',
        }}
      />
    );
  }

  if (isPending) {
    return (
      <SkeletonLoader
        layout="stack"
        count={5}
        className="mx-auto max-w-2xl"
        itemClassName="min-h-16"
        ariaLabel="Загружаем объявление"
      />
    );
  }

  if (isError || !ad) {
    return (
      <ErrorMessage>Объявление не найдено.</ErrorMessage>
    );
  }

  return (
    <div className="space-y-8 md:rounded-3xl md:bg-page md:p-5 md:shadow-card-2xl lg:p-8 xl:p-10 ">
      <SectionHeader
        title="Редактирование объявления"
        description="Обновите информацию об объявлении."
      />

      <AdForm
        initialAd={ad}
        submitLabel="Сохранить изменения"
        isPending={updateMutation.isPending}
        onUploadImage={(file) =>
          uploadAdImage(accessToken, file).then((response) => response.url)
        }
        onSubmit={(payload) => updateMutation.mutateAsync(payload).then(() => {})}
        onCancel={() => navigate('/ads/my')}
      />
    </div>
  );
}
