import { Button } from '@/components/ui/Button';

type ProfileSessionErrorStateProps = {
  onLogout: () => void;
};

export function ProfileSessionErrorState({
  onLogout,
}: ProfileSessionErrorStateProps) {
  return (
    <section className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-8 text-center">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Сессия недоступна</h1>

        <p className="text-sm text-muted-foreground">
          Не удалось получить данные пользователя. Возможно, токен устарел.
        </p>
      </div>

      <Button type="button" className="mt-6" onClick={onLogout}>
        Выйти из профиля
      </Button>
    </section>
  );
}