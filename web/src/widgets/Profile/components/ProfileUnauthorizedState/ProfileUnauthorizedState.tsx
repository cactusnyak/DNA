import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';

export function ProfileUnauthorizedState() {
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