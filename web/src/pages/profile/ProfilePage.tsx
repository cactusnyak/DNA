import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/Section';
import {
  getCurrentUser,
  useAuthStore,
} from '@/entities/auth';
import { formatPrice } from '@/shared/utils/format-price';

export function ProfilePage() {
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
    return (
      <section className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-8 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Профиль недоступен</h1>

          <p className="text-sm text-muted-foreground">
            Войдите или зарегистрируйтесь, чтобы видеть историю заказов, баланс,
            кешбэк и реферальную систему.
          </p>
        </div>

        <Button asChild className="mt-6">
          <Link to="/authorization">Войти или зарегистрироваться</Link>
        </Button>
      </section>
    );
  }

  if (isPending) {
    return <p className="text-muted-foreground">Загрузка профиля...</p>;
  }

  if (error || !user) {
    return (
      <section className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-8 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Сессия недоступна</h1>

          <p className="text-sm text-muted-foreground">
            Не удалось получить данные пользователя. Возможно, токен устарел.
            Ну вот, даже строка символов не вечна.
          </p>
        </div>

        <Button
          type="button"
          className="mt-6"
          onClick={clearAccessToken}
        >
          Выйти из профиля
        </Button>
      </section>
    );
  }

  const balanceValue = user.balance?.value ?? 0;

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Профиль"
        description="Личные данные, баланс и будущая история заказов."
      />

      <section className="grid gap-4 md:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-lg font-semibold">Личные данные</h2>

          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Имя</dt>
              <dd className="mt-1 font-medium">{user.firstName}</dd>
            </div>

            <div>
              <dt className="text-muted-foreground">Фамилия</dt>
              <dd className="mt-1 font-medium">{user.lastName}</dd>
            </div>

            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="mt-1 font-medium">{user.email}</dd>
            </div>

            <div>
              <dt className="text-muted-foreground">Телефон</dt>
              <dd className="mt-1 font-medium">
                {user.phone ?? 'Не указан'}
              </dd>
            </div>

            <div>
              <dt className="text-muted-foreground">Роль</dt>
              <dd className="mt-1 font-medium">{user.role}</dd>
            </div>

            <div>
              <dt className="text-muted-foreground">Реферальный код</dt>
              <dd className="mt-1 font-medium">
                {user.referralCode ?? 'Не создан'}
              </dd>
            </div>
          </dl>
        </div>

        <aside className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-lg font-semibold">Баланс</h2>

          <p className="mt-4 text-3xl font-semibold">
            {formatPrice(balanceValue)}
          </p>

          <p className="mt-2 text-sm text-muted-foreground">
            Баланс будет использоваться для кешбэка, реферальных начислений и
            будущих выводов средств.
          </p>

          <Button
            type="button"
            variant="outline"
            className="mt-6 w-full"
            onClick={clearAccessToken}
          >
            Выйти
          </Button>
        </aside>
      </section>
    </div>
  );
}