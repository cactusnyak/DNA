import type { ChangeEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { FormInputField } from '@/components/ui/FormField';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { getOAuthUrl, type OAuthProvider } from '@/entities/auth';
import { LegalFormNotice } from '@/shared/legal/LegalFormNotice';

import { authorizationMethodItems } from '../../data/authorization-method-items';
import { authorizationModeItems } from '../../data/authorization-mode-items';
import { oauthProviderItems } from '../../data/oauth-provider-items';
import type {
  AuthorizationFormMethod,
  AuthorizationFormValue,
  AuthorizationMode,
} from '../../types/authorization-form';

type AuthorizationStep = 'login' | 'otp';

type AuthorizationFormProps = {
  mode: AuthorizationMode;
  step: AuthorizationStep;
  activeMethod: AuthorizationFormMethod;
  availableFormMethods: AuthorizationFormMethod[];
  value: AuthorizationFormValue;
  isPending?: boolean;
  errorMessage?: string;
  resendSeconds?: number;
  availableOAuthProviders?: OAuthProvider[];
  onModeChange: (mode: AuthorizationMode) => void;
  onMethodChange: (method: AuthorizationFormMethod) => void;
  onChange: (value: AuthorizationFormValue) => void;
  onSendOtp: () => void;
  onVerifyOtp: () => void;
  onSubmitEmail: () => void;
};

export function AuthorizationForm({
  mode,
  step,
  activeMethod,
  availableFormMethods,
  value,
  isPending = false,
  errorMessage,
  resendSeconds = 0,
  availableOAuthProviders = oauthProviderItems.map((item) => item.id),
  onModeChange,
  onMethodChange,
  onChange,
  onSendOtp,
  onVerifyOtp,
  onSubmitEmail,
}: AuthorizationFormProps) {
  const isRegisterMode = mode === 'register';
  const isEmailMethod = activeMethod === 'email';
  const isOtpStep = activeMethod === 'otp' && step === 'otp';

  const visibleOAuthProviderItems = oauthProviderItems.filter((item) =>
    availableOAuthProviders.includes(item.id),
  );

  const visibleMethodItems = authorizationMethodItems.filter((item) =>
    availableFormMethods.includes(item.method),
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

    if (isEmailMethod) {
      onSubmitEmail();
      return;
    }

    onSendOtp();
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-card-2xl max-w-xl mx-auto flex flex-col gap-6">
      <header className="flex flex-col gap-2">
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
            : 'Заказ в Маркете можно оформить без регистрации. Профиль нужен для истории заказов, реферального кода и дерева приглашений. Финансовые функции пока разрабатываются.'}
        </p>
      </header>

      {!isOtpStep && (
        <div className="flex flex-col gap-3">
          <SegmentedControl
            options={authorizationModeItems.map((item) => ({
              value: item.mode,
              label: item.label,
            }))}
            value={mode}
            onChange={onModeChange}
            className="flex w-full shrink-0 h-12"
          />

          {visibleMethodItems.length > 1 && (
            <SegmentedControl
              options={visibleMethodItems.map((item) => ({
                value: item.method,
                label: item.label,
              }))}
              value={activeMethod}
              onChange={onMethodChange}
              className="flex w-full shrink-0 h-12"
            />
          )}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6"
        autoComplete="off"
      >
        <div className="flex flex-col gap-4">
          {isOtpStep ? (
            <>
              <FormInputField
                name="otpCode"
                required
                type="text"
                inputMode="numeric"
                label="Код подтверждения"
                caption="Введите 6-значный код из письма или SMS"
                value={value.otpCode}
                placeholder="000000"
                autoComplete="off"
                maxLength={6}
                pattern="[0-9]{6}"
                onChange={getInputChangeHandler('otpCode')}
              />
            </>
          ) : (
            <>
              {isRegisterMode && (
                <FormInputField
                  name="nickname"
                  required
                  label="Имя аккаунта"
                  value={value.nickname}
                  placeholder="Например, Иван"
                  autoComplete="off"
                  onChange={getInputChangeHandler('nickname')}
                />
              )}

              <FormInputField
                name="login"
                required
                type={isEmailMethod ? 'email' : 'text'}
                inputMode="email"
                label={isEmailMethod ? 'Email' : 'Телефон'}
                value={value.login}
                placeholder={isEmailMethod ? 'you@example.com' : '+7 900 000-00-00'}
                autoComplete="off"
                onChange={getInputChangeHandler('login')}
              />

              {isEmailMethod && (
                <FormInputField
                  name="password"
                  required
                  type="password"
                  label="Пароль"
                  caption={
                    isRegisterMode ? 'Минимум 8 символов' : undefined
                  }
                  value={value.password}
                  placeholder="••••••••"
                  minLength={8}
                  autoComplete="off"
                  onChange={getInputChangeHandler('password')}
                />
              )}

              {isEmailMethod && !isRegisterMode && (
                <Link
                  to="/forgot-password"
                  className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
                >
                  Забыли пароль?
                </Link>
              )}
            </>
          )}
        </div>

        {errorMessage && (
          <ErrorMessage variant="banner">
            {errorMessage}
          </ErrorMessage>
        )}

        {isOtpStep ? (
          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              variant="accent"
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
              disabled={isPending || resendSeconds > 0}
              onClick={onSendOtp}
            >
              {resendSeconds > 0
                ? `Отправить повторно через ${resendSeconds} сек.`
                : 'Отправить код повторно'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              disabled={isPending}
              onClick={() => onModeChange(mode)}
            >
              Изменить телефон
            </Button>
          </div>
        ) : (
          <>
            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="w-full"
              disabled={isPending}
            >
              {isEmailMethod
                ? isPending
                  ? isRegisterMode
                    ? 'Регистрируем...'
                    : 'Входим...'
                  : isRegisterMode
                    ? 'Зарегистрироваться'
                    : 'Войти'
                : isPending
                  ? 'Отправляем код...'
                  : 'Получить код'}
            </Button>

            <LegalFormNotice />

            {visibleOAuthProviderItems.length > 0 && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/80" />
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
                        variant="secondary"
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
