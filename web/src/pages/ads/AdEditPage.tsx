import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';

import { SectionHeader } from '@/components/ui/Section';
import {
  getAd,
  updateAd,
  uploadAdImage,
  type UpdateAdPayload,
} from '@/entities/ad';
import { useAuthStore } from '@/entities/auth';
import { AdForm } from '@/widgets/AdForm';
import { StateCard } from '@/widgets/StateCard';

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
    queryFn: () => getAd(adId ?? ''),
    enabled: Boolean(adId),
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
      <p className="text-sm text-muted-foreground">Загружаем объявление...</p>
    );
  }

  if (isError || !ad) {
    return (
      <p className="text-sm text-destructive">Объявление не найдено.</p>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
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
