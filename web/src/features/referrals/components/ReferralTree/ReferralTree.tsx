import { Network } from 'lucide-react';

import type { ReferralTreeUser } from '@/entities/referral';

import { ReferralTreeNode } from '../ReferralTreeNode';

type ReferralTreeProps = {
  users: ReferralTreeUser[];
  isPending?: boolean;
  isError?: boolean;
};

function ReferralTreeBadge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
      <Network className="size-3.5" />
      Дерево приглашений
    </div>
  );
}

export function ReferralTree({
  users,
  isPending = false,
  isError = false,
}: ReferralTreeProps) {
  if (isPending) {
    return (
      <section className="rounded-3xl border border-border bg-card p-5">
        <ReferralTreeBadge />

        <h2 className="mt-4 text-xl font-semibold">
          Приведённые пользователи
        </h2>

        <p className="mt-4 text-sm text-muted-foreground">
          Загружаем дерево приглашённых...
        </p>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="rounded-3xl border border-border bg-card p-5">
        <ReferralTreeBadge />

        <h2 className="mt-4 text-xl font-semibold">
          Приведённые пользователи
        </h2>

        <p className="mt-4 text-sm text-destructive">
          Не удалось загрузить дерево приглашённых.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-5">
      <div>
        <ReferralTreeBadge />

        <h2 className="mt-4 text-xl font-semibold">
          Приведённые пользователи
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Здесь отображаются пользователи, зарегистрированные по вашей
          реферальной ссылке, и связанные уровни приглашений.
        </p>
      </div>

      <div className="mt-5 max-h-[520px] overflow-y-auto pr-2">
        {users.length > 0 ? (
          <ul className="space-y-3">
            {users.map((user) => (
              <ReferralTreeNode key={user.id} user={user} />
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-background p-6 text-center">
            <p className="font-medium">Пока никого нет</p>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Скопируйте реферальную ссылку и отправьте её человеку, которого
              хотите пригласить в DNA.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
