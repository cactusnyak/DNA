import type { ChangeEvent, FormEvent } from 'react';

import { Button } from '@/components/ui/Button';
import { FormInputField } from '@/components/ui/FormField';
import { getOAuthUrl, type OAuthProvider } from '@/entities/auth';

import { authorizationModeItems } from '../../data/authorization-mode-items';
import { oauthProviderItems } from '../../data/oauth-provider-items';
import type {
  AuthorizationFormValue,
  AuthorizationMode,
} from '../../types/authorization-form';

type AuthorizationStep = 'login' | 'otp';

type AuthorizationFormProps = {
  mode: AuthorizationMode;
  step: AuthorizationStep;
  value: AuthorizationFormValue;
  isPending?: boolean;
  errorMessage?: string;
  availableOAuthProviders?: OAuthProvider[];
  onModeChange: (mode: AuthorizationMode) => void;
  onChange: (value: AuthorizationFormValue) => void;
  onSendOtp: () => void;
  onVerifyOtp: () => void;
};

export function AuthorizationForm({
  mode,
  step,
  value,
  isPending = false,
  errorMessage,
  availableOAuthProviders = oauthProviderItems.map((item) => item.id),
  onModeChange,
  onChange,
  onSendOtp,
  onVerifyOtp,
}: AuthorizationFormProps) {
  const isRegisterMode = mode === 'register';
  const isOtpStep = step === 'otp';

  const visibleOAuthProviderItems = oauthProviderItems.filter((item) =>
    availableOAuthProviders.includes(item.id),
  );

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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isOtpStep) {
      onVerifyOtp();
      return;
    }

    onSendOtp();
  }

  return (
    <section className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-5 sm:p-6">
      <header className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          {isOtpStep
            ? 'Подтверждение'
            : isRegisterMode
              ? 'Регистрация'
              : 'Вход'}
        </p>

        <h1 className="text-2xl font-semibold">
          {isOtpStep
            ? 'Введите код'
            : isRegisterMode
              ? 'Создать профиль DNA'
              : 'Войти в профиль'}
        </h1>

        <p className="text-sm leading-6 text-muted-foreground">
          {isOtpStep
            ? `Мы отправили код на ${value.login}. Введите его ниже.`
            : 'Покупать можно без регистрации. Аккаунт нужен для истории заказов, кешбэка, реферальной системы и заработка.'}
        </p>
      </header>

      {!isOtpStep && (
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
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-6"
        autoComplete="off"
      >
        <div className="space-y-4">
          {isOtpStep ? (
            <>
              <FormInputField
                required
                type="text"
                inputMode="numeric"
                label="Код подтверждения"
                value={value.otpCode}
                placeholder="000000"
                autoComplete="one-time-code"
                onChange={getInputChangeHandler('otpCode')}
              />
            </>
          ) : (
            <>
              {isRegisterMode && (
                <FormInputField
                  required
                  label="Имя аккаунта"
                  value={value.nickname}
                  placeholder=""
                  autoComplete="off"
                  onChange={getInputChangeHandler('nickname')}
                />
              )}

              <FormInputField
                required
                type="text"
                inputMode="email"
                label="Email или телефон"
                value={value.login}
                placeholder=""
                autoComplete="username"
                onChange={getInputChangeHandler('login')}
              />
            </>
          )}
        </div>

        {errorMessage && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errorMessage}
          </p>
        )}

        {isOtpStep ? (
          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isPending}
            >
              {isPending ? 'Проверяем код...' : 'Подтвердить'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              disabled={isPending}
              onClick={onSendOtp}
            >
              Отправить код повторно
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              disabled={isPending}
              onClick={() => onModeChange(mode)}
            >
              Изменить email или телефон
            </Button>
          </div>
        ) : (
          <>
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isPending}
            >
              {isPending ? 'Отправляем код...' : 'Получить код'}
            </Button>

            {visibleOAuthProviderItems.length > 0 && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Или
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {visibleOAuthProviderItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <Button
                        key={item.id}
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                          window.location.assign(
                            getOAuthUrl(
                              item.id,
                              mode,
                              value.inviterReferralCode,
                            ),
                          )
                        }
                      >
                        <Icon />
                        {item.label}
                      </Button>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </form>
    </section>
  );
}