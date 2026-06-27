import type { ChangeEvent, FormEvent } from 'react';

import { Button } from '@/components/ui/Button';
import { FormInputField } from '@/components/ui/FormField';

import { authorizationModeItems } from '../../data/authorization-mode-items';
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

const PASSWORD_MIN_LENGTH = 6;

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

  function getInputChangeHandler(field: keyof AuthorizationFormValue) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      updateField(field, event.target.value);
    };
  }

  return (
    <section className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-5 sm:p-6">
      <header className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          {isRegisterMode ? 'Регистрация' : 'Вход'}
        </p>

        <h1 className="text-2xl font-semibold">
          {isRegisterMode ? 'Создать профиль DNA' : 'Войти в профиль'}
        </h1>

        <p className="text-sm leading-6 text-muted-foreground">
          Покупать можно без регистрации. Аккаунт нужен для истории заказов,
          кешбэка, реферальной системы и заработка.
        </p>
      </header>

      <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
        {authorizationModeItems.map((item) => {
          const isActive = mode === item.mode;

          return (
            <Button
              key={item.mode}
              type="button"
              variant={isActive ? 'default' : 'ghost'}
              className="h-9"
              onClick={() => onModeChange(item.mode)}
            >
              {item.label}
            </Button>
          );
        })}
      </div>

      <form
        onSubmit={onSubmit}
        className="mt-6 space-y-6"
        autoComplete="off"
      >
        <div className="space-y-4">
          {isRegisterMode && (
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInputField
                required
                label="Имя"
                value={value.firstName}
                placeholder=""
                autoComplete="off"
                onChange={getInputChangeHandler('firstName')}
              />

              <FormInputField
                required
                label="Фамилия"
                value={value.lastName}
                placeholder=""
                autoComplete="off"
                onChange={getInputChangeHandler('lastName')}
              />
            </div>
          )}

          <FormInputField
            required
            type="email"
            label="Email"
            value={value.email}
            placeholder=""
            autoComplete="off"
            onChange={getInputChangeHandler('email')}
          />

          <FormInputField
            required
            type="password"
            label="Пароль"
            value={value.password}
            minLength={PASSWORD_MIN_LENGTH}
            placeholder=""
            caption={`Минимум ${PASSWORD_MIN_LENGTH} символов`}
            autoComplete="new-password"
            onChange={getInputChangeHandler('password')}
          />

          {isRegisterMode && (
            <>
              <FormInputField
                type="tel"
                label="Телефон"
                value={value.phone}
                placeholder=""
                caption="Необязательно"
                autoComplete="off"
                onChange={getInputChangeHandler('phone')}
              />

              <FormInputField
                label="Реферальный код"
                value={value.inviterReferralCode}
                placeholder=""
                caption="Необязательно"
                autoComplete="off"
                onChange={getInputChangeHandler('inviterReferralCode')}
              />
            </>
          )}
        </div>

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