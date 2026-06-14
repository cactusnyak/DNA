import type { User } from '@/entities/user';

type ProfileDetailsCardProps = {
  user: User;
};

export function ProfileDetailsCard({ user }: ProfileDetailsCardProps) {
  return (
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
          <dd className="mt-1 font-medium">{user.phone ?? 'Не указан'}</dd>
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
  );
}