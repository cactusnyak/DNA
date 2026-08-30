import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';

import { ContentCard } from '@/components/ui/ContentCard';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useAuthStore } from '@/entities/auth';
import { getOrder } from '@/entities/order';
import { useSessionStore } from '@/entities/session';
import { Checkout } from '@/features/checkout';
import { CheckoutPaymentState } from '@/features/checkout/components/CheckoutPaymentState/CheckoutPaymentState';

export function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId')?.trim() ?? '';
  const accessToken = useAuthStore((state) => state.accessToken) ?? '';
  const guestSessionId = useSessionStore((state) => state.guestSessionId);

  const orderQuery = useQuery({
    queryKey: ['my-order', orderId, accessToken, guestSessionId],
    queryFn: () => getOrder(
      orderId,
      accessToken || undefined,
      accessToken ? undefined : guestSessionId
    ),
    enabled: Boolean(orderId && (accessToken || guestSessionId)),
  });

  if (orderId) {
    if (!accessToken && !guestSessionId) {
      return (
        <ContentCard>
          <div className="flex flex-col items-start gap-4">
            <ErrorMessage>
              Сессия заказа не найдена. Войдите в профиль или начните новое оформление.
            </ErrorMessage>
            <Link to="/authorization" className="underline">
              Войти
            </Link>
          </div>
        </ContentCard>
      );
    }

    if (orderQuery.isPending) {
      return <ContentCard>Загружаем заказ…</ContentCard>;
    }

    if (orderQuery.isError || !orderQuery.data) {
      return (
        <ContentCard>
          <div className="flex flex-col items-start gap-4">
            <ErrorMessage>Заказ не найден или недоступен.</ErrorMessage>
            <Link to="/profile" className="underline">
              Вернуться в профиль
            </Link>
          </div>
        </ContentCard>
      );
    }

    if (orderQuery.data.status !== 'AWAITING_PAYMENT') {
      return (
        <ContentCard>
          <div className="flex flex-col items-start gap-4">
            <p>Этот заказ больше не ожидает оплаты.</p>
            <Link to={`/orders/${orderId}`} className="underline">
              Открыть заказ
            </Link>
          </div>
        </ContentCard>
      );
    }

    return <CheckoutPaymentState order={orderQuery.data} />;
  }

  return <Checkout />;
}
