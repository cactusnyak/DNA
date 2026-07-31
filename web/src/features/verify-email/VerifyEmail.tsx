import { useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { confirmEmailVerification } from '@/entities/auth';

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const processedTokenRef = useRef<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => confirmEmailVerification(token),
  });

  useEffect(() => {
    if (!token || processedTokenRef.current === token) {
      return;
    }

    processedTokenRef.current = token;
    mutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <section className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-5 sm:p-6">
      <h1 className="text-2xl font-semibold">Подтверждение почты</h1>

      <div className="mt-6 space-y-4">
        {!token && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            В ссылке отсутствует токен подтверждения.
          </p>
        )}

        {mutation.isPending && (
          <p className="text-sm text-muted-foreground">Проверяем ссылку...</p>
        )}

        {mutation.isSuccess && (
          <p className="rounded-lg border border-border bg-muted/40 px-3 py-3 text-sm">
            Почта успешно подтверждена.
          </p>
        )}

        {mutation.isError && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Ссылка для подтверждения недействительна или устарела.
          </p>
        )}

        <Button asChild variant="secondary" className="w-full">
          <Link to="/profile">Перейти в профиль</Link>
        </Button>
      </div>
    </section>
  );
}
