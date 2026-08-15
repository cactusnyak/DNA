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
    <section className="rounded-2xl bg-white p-6 shadow-card-2xl max-w-xl mx-auto flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted-foreground">Восстановление доступа</p>
        <h1 className="text-2xl font-semibold">Забыли пароль?</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Укажите email, привязанный к аккаунту. Мы отправим ссылку для сброса пароля.
        </p>
      </header>

      {mutation.isSuccess ? (
        <div className="flex flex-col gap-4">
          <p className="rounded-lg border border-primary/12 bg-muted/40 px-3 py-3 text-sm">
            Если аккаунт с таким email существует, на него отправлена ссылка для сброса пароля.
            Проверьте почту, включая папку «Спам».
          </p>
          <Button asChild variant="secondary" className="w-full">
            <Link to="/authorization">Вернуться ко входу</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6" autoComplete="off">
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

          <div className='flex flex-col gap-2'>
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
          </div>
        </form>
      )}
    </section>
  );
}
