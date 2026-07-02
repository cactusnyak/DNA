import type { AdminOverview } from '@/entities/admin';
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
        <h2 className="text-xl font-semibold">Сводки</h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <AdminOverviewCard
            label="Пользователи"
            value={getOverviewValue(overview?.usersCount, isOverviewPending)}
            description="Активные зарегистрированные пользователи."
          />
        </div>
      </section>
    </div>
  );
}
