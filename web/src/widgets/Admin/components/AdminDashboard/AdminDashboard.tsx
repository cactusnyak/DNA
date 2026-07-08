import { Fragment, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronRight } from 'lucide-react';

import { getAdminReferrals, type AdminOverview } from '@/entities/admin';
import { SectionHeader } from '@/components/ui/Section';

import { AdminManagement } from '../AdminManagement';
import { AdminOverviewCard } from '../AdminOverviewCard';

type AdminDashboardProps = {
  accessToken: string;
  overview?: AdminOverview;
  isOverviewPending?: boolean;
  isOverviewError?: boolean;
};

function getOverviewValue(value?: number, isPending?: boolean) {
  if (isPending) {
    return '...';
  }

  return value ?? 0;
}

function AdminReferralsView({ accessToken }: { accessToken: string }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const { data: users = [], isPending, isError } = useQuery({
    queryKey: ['admin-referrals', accessToken],
    queryFn: () => getAdminReferrals(accessToken),
  });

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      !q ||
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.referralCode ?? '').toLowerCase().includes(q)
    );
  });

  if (isPending) return <p className="text-sm text-muted-foreground">Загружаем реферальную статистику...</p>;
  if (isError) return <p className="text-sm text-destructive">Не удалось загрузить данные рефералов.</p>;

  return (
    <div className="space-y-4">
      <input
        type="search"
        placeholder="Поиск по имени, email или коду..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-9 w-full max-w-sm rounded-lg border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-border"
      />

      <div className="overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Пользователь</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Код</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Роль</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Приглашённых</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((user) => (
              <Fragment key={user.id}>
                <tr
                  className="cursor-pointer transition-colors hover:bg-muted/30"
                  onClick={() => setExpanded(expanded === user.id ? null : user.id)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {user.directReferralsCount > 0 ? (
                        expanded === user.id ? <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" /> : <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
                      ) : (
                        <span className="size-3.5" />
                      )}
                      <span className="font-medium">{user.firstName} {user.lastName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{user.referralCode ?? '—'}</code>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{user.role}</td>
                  <td className="px-4 py-3 text-right font-semibold">{user.directReferralsCount}</td>
                </tr>

                {expanded === user.id && user.directReferrals.length > 0 && (
                  <tr key={`${user.id}-refs`}>
                    <td colSpan={5} className="bg-muted/20 px-10 py-2">
                      <ul className="space-y-1">
                        {user.directReferrals.map((ref) => (
                          <li key={ref.id} className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className={ref.isDeleted ? 'line-through' : ''}>
                              {ref.firstName} {ref.lastName}
                            </span>
                            <span>{ref.email}</span>
                            <span>{new Date(ref.joinedAt).toLocaleDateString('ru-RU')}</span>
                            {ref.isDeleted && <span className="text-destructive">(удалён)</span>}
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-muted-foreground">
                  Пользователи не найдены.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminDashboard({
  accessToken,
  overview,
  isOverviewPending = false,
  isOverviewError = false,
}: AdminDashboardProps) {
  return (
    <div className="space-y-10">
      <SectionHeader
        title="Админ-панель"
        description="Управление каталогом, подборками, заказами и базовыми сущностями сервиса."
      />

      {isOverviewError && (
        <div className="rounded-2xl border border-destructive/20 p-5">
          <p className="text-sm text-destructive">
            Не удалось загрузить сводку админки.
          </p>
        </div>
      )}

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">База данных</h2>
        <AdminManagement accessToken={accessToken} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Рефералы</h2>
        <AdminReferralsView accessToken={accessToken} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Сводки</h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AdminOverviewCard
            label="Пользователи"
            value={getOverviewValue(overview?.usersCount, isOverviewPending)}
            description="Активные зарегистрированные пользователи."
          />
          <AdminOverviewCard
            label="Категории маркета"
            value={getOverviewValue(
              overview?.marketCategoriesCount,
              isOverviewPending,
            )}
            description="Активные категории каталога маркета."
          />
          <AdminOverviewCard
            label="Товары маркета"
            value={getOverviewValue(overview?.productsCount, isOverviewPending)}
            description="Активные товары маркета."
          />
          <AdminOverviewCard
            label="Заказы"
            value={getOverviewValue(overview?.ordersCount, isOverviewPending)}
            description="Всего оформленных заказов."
          />
          <AdminOverviewCard
            label="Категории объявлений"
            value={getOverviewValue(
              overview?.adCategoriesCount,
              isOverviewPending,
            )}
            description="Активные категории доски объявлений."
          />
          <AdminOverviewCard
            label="Объявления"
            value={getOverviewValue(overview?.adsCount, isOverviewPending)}
            description="Активные объявления пользователей."
          />
        </div>
      </section>
    </div>
  );
}

