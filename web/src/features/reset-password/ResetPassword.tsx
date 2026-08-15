import { type FormEvent, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { HttpError } from '@/shared/api/http-client';

import { Button } from '@/components/ui/Button';
import { FormInputField } from '@/components/ui/FormField';
import { confirmPasswordReset } from '@/entities/auth';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [newPassword, setNewPassword] = useState('');

  const mutation = useMutation({
    mutationFn: () => confirmPasswordReset(token, newPassword),
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (mutation.isPending) return;
    mutation.mutate();
  }

  const errorMessage =
    mutation.error instanceof HttpError
      ? mutation.error.status === 400
        ? 'Ссылка для сброса пароля недействительна или устарела. Запросите новую.'
        : 'Не удалось обновить пароль. Попробуйте ещё раз.'
      : undefined;

  if (!token) {
    return (
      <section className="rounded-2xl bg-white p-6 shadow-card-2xl max-w-xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">Ссылка недействительна</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            В ссылке отсутствует токен сброса пароля. Запросите новую ссылку.
          </p>
        </div>
        <Button asChild variant="secondary" className="w-full">
          <Link to="/forgot-password">Запросить новую ссылку</Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-card-2xl max-w-xl mx-auto flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted-foreground">Восстановление доступа</p>
        <h1 className="text-2xl font-semibold">Новый пароль</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Придумайте новый пароль для входа в аккаунт.
        </p>
      </header>

      {mutation.isSuccess ? (
        <div className="flex flex-col gap-4">
          <p className="rounded-lg border border-border/80 bg-muted/40 px-3 py-3 text-sm">
            Пароль успешно обновлён. Теперь вы можете войти с новым паролем.
          </p>
          <Button asChild variant="accent" className="w-full">
            <Link to="/authorization">Войти</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6" autoComplete="off">
          <FormInputField
            name="newPassword"
            required
            type="password"
            label="Новый пароль"
            caption="Минимум 8 символов"
            value={newPassword}
            placeholder="••••••••"
            minLength={8}
            autoComplete="off"
            onChange={(event) => setNewPassword(event.target.value)}
          />

          {errorMessage && (
            <ErrorMessage variant="banner">
              {errorMessage}
            </ErrorMessage>
          )}

          <Button
            type="submit"
            variant="accent"
            size="lg"
            className="w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Обновляем...' : 'Обновить пароль'}
          </Button>
        </form>
      )}
    </section>
  );
}
