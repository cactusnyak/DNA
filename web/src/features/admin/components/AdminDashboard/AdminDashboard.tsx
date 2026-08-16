import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { type AdminOverview } from '@/entities/admin';
import { ContentCard } from '@/components/ui/ContentCard';
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
    <ContentCard>
      <SectionHeader
        title="Админ-панель"
        description="Управление каталогом, подборками, заказами и базовыми сущностями сервиса."
      />

      {isOverviewError && (
          <ErrorMessage>
            Не удалось загрузить сводку админки.
          </ErrorMessage>
      )}

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">База данных</h2>
        <AdminManagement accessToken={accessToken} />
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Сводки</h2>

        <div className="grid gap-px bg-border/50 sm:grid-cols-2 xl:grid-cols-3">
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
    </ContentCard>
  );
}
