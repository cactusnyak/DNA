import { useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
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
  }, [token]);

  return (
    <section className="rounded-2xl bg-white p-6 shadow-card-2xl max-w-xl mx-auto flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Подтверждение почты</h1>

      <div className="flex flex-col gap-4">
        {!token && (
          <ErrorMessage variant="banner">
            В ссылке отсутствует токен подтверждения.
          </ErrorMessage>
        )}

        {mutation.isPending && (
          <p className="text-sm text-muted-foreground">Проверяем ссылку...</p>
        )}

        {mutation.isSuccess && (
          <p className="rounded-lg border border-border/80 bg-muted/40 px-3 py-3 text-sm">
            Почта успешно подтверждена.
          </p>
        )}

        {mutation.isError && (
          <ErrorMessage variant="banner">
            Ссылка для подтверждения недействительна или устарела.
          </ErrorMessage>
        )}

        <Button asChild variant="secondary" className="w-full">
          <Link to="/profile">Перейти в профиль</Link>
        </Button>
      </div>
    </section>
  );
}
