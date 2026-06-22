import { LogOut, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/Button';

type ProfileDangerZoneProps = {
  isDeletePending?: boolean;
  onLogout: () => void;
  onDeleteAccount: () => void;
};

export function ProfileDangerZone({
  isDeletePending = false,
  onLogout,
  onDeleteAccount,
}: ProfileDangerZoneProps) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-destructive">
        Опасная зона
      </h2>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        Действия ниже влияют на доступ к профилю. Будь чуть аккуратнее!
      </p>

      <div className="mt-5 overflow-hidden rounded-xl border border-destructive/20">
        <article className="border-b border-destructive/20 px-4 py-4 last:border-b-0">
          <h3 className="text-sm font-semibold">Выйти из профиля</h3>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Завершает текущую сессию на этом устройстве. Аккаунт и данные
            останутся сохранены.
          </p>

          <Button
            type="button"
            variant="outline"
            className="mt-4 w-full sm:w-auto"
            onClick={onLogout}
          >
            <LogOut className="size-4" />
            Выйти из профиля
          </Button>
        </article>

        <article className="px-4 py-4">
          <h3 className="text-sm font-semibold text-destructive">
            Удалить аккаунт
          </h3>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Удаляет профиль пользователя. Это действие должно быть необратимым
            после подтверждения на backend.
          </p>

          <Button
            type="button"
            variant="destructive"
            className="mt-4 w-full sm:w-auto"
            disabled={isDeletePending}
            onClick={onDeleteAccount}
          >
            <Trash2 className="size-4" />
            {isDeletePending ? 'Удаляем аккаунт...' : 'Удалить аккаунт'}
          </Button>
        </article>
      </div>
    </section>
  );
}