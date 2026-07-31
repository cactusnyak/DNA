import { type FormEvent, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { FormInputField } from '@/components/ui/FormField';
import { requestPasswordReset } from '@/entities/auth';

export function ForgotPassword() {
  const [email, setEmail] = useState('');

  const mutation = useMutation({
    mutationFn: () => requestPasswordReset(email.trim()),
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (mutation.isPending) return;
    mutation.mutate();
  }

  return (
    <section className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-5 sm:p-6">
      <header className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Восстановление доступа</p>
        <h1 className="text-2xl font-semibold">Забыли пароль?</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Укажите email, привязанный к аккаунту. Мы отправим ссылку для сброса пароля.
        </p>
      </header>

      {mutation.isSuccess ? (
        <div className="mt-6 space-y-4">
          <p className="rounded-lg border border-border bg-muted/40 px-3 py-3 text-sm">
            Если аккаунт с таким email существует, на него отправлена ссылка для сброса пароля.
            Проверьте почту, включая папку «Спам».
          </p>
          <Button asChild variant="secondary" className="w-full">
            <Link to="/authorization">Вернуться ко входу</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-6" autoComplete="off">
          <FormInputField
            name="email"
            required
            type="email"
            inputMode="email"
            label="Email"
            value={email}
            placeholder="you@example.com"
            autoComplete="off"
            onChange={(event) => setEmail(event.target.value)}
          />

          <Button
            type="submit"
            variant="accent"
            size="lg"
            className="w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Отправляем...' : 'Отправить ссылку'}
          </Button>

          <Button asChild variant="ghost" className="w-full">
            <Link to="/authorization">Вернуться ко входу</Link>
          </Button>
        </form>
      )}
    </section>
  );
}
