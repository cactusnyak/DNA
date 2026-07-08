import { Link } from 'react-router-dom';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { Button } from '@/components/ui/Button';
import { deleteAd, formatAdStatus, getMyAds } from '@/entities/ad';
import { useAuthStore } from '@/entities/auth';
import { formatPrice } from '@/shared/utils/format-price';
import { StateCard } from '@/widgets/StateCard';

export function MyAdsManager() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  const {
    data: ads = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ['my-ads', accessToken],
    queryFn: () => getMyAds(accessToken ?? ''),
    enabled: Boolean(accessToken),
  });

  const deleteMutation = useMutation({
    mutationFn: (adId: string) => deleteAd(accessToken ?? '', adId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-ads', accessToken] });
    },
  });

  if (!accessToken) {
    return (
      <StateCard
        title="Мои объявления недоступны"
        description="Войдите в аккаунт, чтобы создавать объявления и управлять ими."
        action={{
          label: 'Войти',
          to: '/authorization',
        }}
      />
    );
  }

  function handleDelete(adId: string) {
    if (!window.confirm('Удалить объявление?')) {
      return;
    }

    deleteMutation.mutate(adId);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Мои объявления</h2>

        <Button asChild>
          <Link to="/ads/new">Разместить объявление</Link>
        </Button>
      </div>

      {isPending && (
        <p className="text-sm text-muted-foreground">Загружаем объявления...</p>
      )}

      {isError && (
        <div className="rounded-2xl border border-destructive/20 p-5">
          <p className="text-sm text-destructive">
            Не удалось загрузить ваши объявления.
          </p>
        </div>
      )}

      {!isPending && !isError && !ads.length && (
        <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          У вас пока нет объявлений.
        </div>
      )}

      <ul className="space-y-3">
        {ads.map((ad) => {
          const cover = ad.images?.[0];

          return (
          <li
            key={ad.id}
            className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4"
          >
            <Link
              to={`/ads/ad/${ad.id}`}
              className="size-16 shrink-0 overflow-hidden rounded-xl bg-muted"
            >
              {cover ? (
                <img
                  src={cover.url}
                  alt={cover.alt ?? ad.title}
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                  Нет фото
                </div>
              )}
            </Link>

            <div className="min-w-0 flex-1">
              <Link
                to={`/ads/ad/${ad.id}`}
                className="font-semibold underline-offset-4 hover:underline"
              >
                {ad.title}
              </Link>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatPrice(ad.price)} · {formatAdStatus(ad.status)}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to={`/ads/my/${ad.id}/edit`}>Редактировать</Link>
              </Button>

              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={deleteMutation.isPending}
                onClick={() => handleDelete(ad.id)}
              >
                Удалить
              </Button>
            </div>
          </li>
          );
        })}
      </ul>
    </div>
  );
}
