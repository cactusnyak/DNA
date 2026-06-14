import type { FormEvent } from 'react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

import type {
  AuthorizationFormValue,
  AuthorizationMode,
} from '../../types/authorization-form';

type AuthorizationFormProps = {
  mode: AuthorizationMode;
  value: AuthorizationFormValue;
  isPending?: boolean;
  errorMessage?: string;
  onModeChange: (mode: AuthorizationMode) => void;
  onChange: (value: AuthorizationFormValue) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function AuthorizationForm({
  mode,
  value,
  isPending = false,
  errorMessage,
  onModeChange,
  onChange,
  onSubmit,
}: AuthorizationFormProps) {
  const isRegisterMode = mode === 'register';

  function updateField(
    field: keyof AuthorizationFormValue,
    fieldValue: string,
  ) {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  }

  return (
    <section className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-5">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          {isRegisterMode ? 'Регистрация' : 'Вход'}
        </p>

        <h1 className="text-2xl font-semibold">
          {isRegisterMode ? 'Создать профиль DNA' : 'Войти в профиль'}
        </h1>

        <p className="text-sm text-muted-foreground">
          Покупать можно без регистрации. Аккаунт нужен для истории заказов,
          кешбэка, реферальной системы и заработка.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
        <Button
          type="button"
          variant={!isRegisterMode ? 'default' : 'ghost'}
          onClick={() => onModeChange('login')}
        >
          Вход
        </Button>

        <Button
          type="button"
          variant={isRegisterMode ? 'default' : 'ghost'}
          onClick={() => onModeChange('register')}
        >
          Регистрация
        </Button>
      </div>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        {isRegisterMode && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-sm font-medium">Имя</span>

              <div className="h-10 rounded-lg border border-border bg-background px-3">
                <Input
                  required
                  value={value.firstName}
                  placeholder="Фёдор"
                  onChange={(event) =>
                    updateField('firstName', event.target.value)
                  }
                />
              </div>
            </label>

            <label className="space-y-1.5">
              <span className="text-sm font-medium">Фамилия</span>

              <div className="h-10 rounded-lg border border-border bg-background px-3">
                <Input
                  required
                  value={value.lastName}
                  placeholder="Шевченко"
                  onChange={(event) =>
                    updateField('lastName', event.target.value)
                  }
                />
              </div>
            </label>
          </div>
        )}

        <label className="space-y-1.5">
          <span className="text-sm font-medium">Email</span>

          <div className="h-10 rounded-lg border border-border bg-background px-3">
            <Input
              required
              type="email"
              value={value.email}
              placeholder="you@example.com"
              onChange={(event) => updateField('email', event.target.value)}
            />
          </div>
        </label>

        <label className="space-y-1.5">
          <span className="text-sm font-medium">Пароль</span>

          <div className="h-10 rounded-lg border border-border bg-background px-3">
            <Input
              required
              type="password"
              minLength={6}
              value={value.password}
              placeholder="Минимум 6 символов"
              onChange={(event) => updateField('password', event.target.value)}
            />
          </div>
        </label>

        {isRegisterMode && (
          <>
            <label className="space-y-1.5">
              <span className="text-sm font-medium">Телефон</span>

              <div className="h-10 rounded-lg border border-border bg-background px-3">
                <Input
                  type="tel"
                  value={value.phone}
                  placeholder="Необязательно"
                  onChange={(event) => updateField('phone', event.target.value)}
                />
              </div>
            </label>

            <label className="space-y-1.5">
              <span className="text-sm font-medium">Реферальный код</span>

              <div className="h-10 rounded-lg border border-border bg-background px-3">
                <Input
                  value={value.inviterReferralCode}
                  placeholder="Необязательно"
                  onChange={(event) =>
                    updateField('inviterReferralCode', event.target.value)
                  }
                />
              </div>
            </label>
          </>
        )}

        {errorMessage && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errorMessage}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isPending}
        >
          {isPending
            ? 'Проверяем данные...'
            : isRegisterMode
              ? 'Создать профиль'
              : 'Войти'}
        </Button>
      </form>
    </section>
  );
}