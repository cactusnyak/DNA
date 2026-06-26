import type { AdminOverview } from '@/entities/admin';
import { SectionHeader } from '@/components/ui/Section';

import { AdminOverviewCard } from '../AdminOverviewCard';
import { adminSections } from '../../data/admin-sections';

type AdminDashboardProps = {
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
  overview,
  isOverviewPending = false,
  isOverviewError = false,
}: AdminDashboardProps) {
  return (
    <div className="space-y-8">
      <SectionHeader
        title="Админ-панель"
        description="Управление каталогом, заказами и базовыми сущностями сервиса."
      />

      {isOverviewError && (
        <div className="rounded-2xl border border-destructive/20 p-5">
          <p className="text-sm text-destructive">
            Не удалось загрузить сводку админки.
          </p>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminOverviewCard
          label="Пользователи"
          value={getOverviewValue(overview?.usersCount, isOverviewPending)}
          description="Все зарегистрированные пользователи, включая админов."
        />

        <AdminOverviewCard
          label="Категории"
          value={getOverviewValue(overview?.categoriesCount, isOverviewPending)}
          description="Категории из базы, включая созданные через seed."
        />

        <AdminOverviewCard
          label="Товары"
          value={getOverviewValue(overview?.productsCount, isOverviewPending)}
          description="Товары из базы, включая тестовые seed-позиции."
        />

        <AdminOverviewCard
          label="Заказы"
          value={getOverviewValue(overview?.ordersCount, isOverviewPending)}
          description="Все заказы: гостевые и пользовательские."
        />
      </section>

      <section>
        <h2 className="text-lg font-semibold">
          Разделы управления
        </h2>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {adminSections.map((section) => {
            const Icon = section.icon;

            return (
              <article
                key={section.title}
                className="rounded-2xl border border-border p-5"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
                  <Icon className="size-5 text-muted-foreground" />
                </div>

                <h3 className="mt-4 text-base font-semibold">
                  {section.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {section.description}
                </p>

                <p className="mt-4 inline-flex rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  {section.status}
                </p>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}