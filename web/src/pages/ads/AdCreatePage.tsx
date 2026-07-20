import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

import { SectionHeader } from '@/components/ui/Section';
import { createAd, type CreateAdPayload, uploadAdImage } from '@/entities/ad';
import { useAuthStore } from '@/entities/auth';
import { AdForm } from '@/widgets/AdForm';
import { StateCard } from '@/components/ui/StateCard';

export function AdCreatePage() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const navigate = useNavigate();

  const createMutation = useMutation({
    mutationFn: (payload: CreateAdPayload) =>
      createAd(accessToken ?? '', payload),
    onSuccess: () => {
      navigate('/ads/my');
    },
  });

  if (!accessToken) {
    return (
      <StateCard
        title="Размещение недоступно"
        description="Войдите в аккаунт, чтобы разместить объявление."
        action={{
          label: 'Войти',
          to: '/authorization',
        }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <SectionHeader
        title="Новое объявление"
        description="Заполните информацию о товаре или услуге. После сохранения объявление появится в разделе «Мои объявления»."
      />

      <AdForm
        submitLabel="Опубликовать"
        isPending={createMutation.isPending}
        onUploadImage={(file) =>
          uploadAdImage(accessToken, file).then((response) => response.url)
        }
        onSubmit={(payload) => createMutation.mutateAsync(payload).then(() => {})}
        onCancel={() => navigate('/ads/my')}
      />
    </div>
  );
}
