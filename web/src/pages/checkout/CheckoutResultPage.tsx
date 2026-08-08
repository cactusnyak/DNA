import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { useCartStore } from '@/entities/cart';
import { useAuthStore } from '@/entities/auth';
import { getPaymentStatus } from '@/entities/order';
import { useSessionStore } from '@/entities/session';
import { Button } from '@/components/ui/Button';

type ResultStatus = 'success' | 'pending' | 'failed';

const statusConfig = {
  success: {
    icon: CheckCircle,
    color: 'text-green-500',
    title: 'Оплата прошла успешно',
    description: 'Платёж принят, заказ передан в обработку.',
  },
  pending: {
    icon: Clock,
    color: 'text-yellow-500',
    title: 'Проверяем платёж',
    description: 'Подтверждение ещё не получено. Обычно это занимает несколько секунд.',
  },
  failed: {
    icon: XCircle,
    color: 'text-destructive',
    title: 'Оплата не прошла',
    description: 'Платёж отменён. Вы можете повторить оплату заказа.',
  },
} satisfies Record<ResultStatus, object>;

export function CheckoutResultPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const accessToken = useAuthStore((state) => state.accessToken);
  const guestSessionId = useSessionStore((state) => state.guestSessionId);
  const clearCart = useCartStore((state) => state.clearCart);

  const query = useQuery({
    queryKey: ['checkout-payment', orderId],
    queryFn: () =>
      getPaymentStatus(
        orderId!,
        accessToken ?? undefined,
        accessToken ? undefined : guestSessionId,
      ),
    enabled: Boolean(orderId),
    refetchInterval: (result) => {
      const status = result.state.data?.paymentStatus;
      return !status || status === 'pending' ? 2_000 : false;
    },
    retry: 2,
  });

  const status: ResultStatus =
    query.data?.paymentStatus === 'succeeded'
      ? 'success'
      : query.data?.paymentStatus === 'canceled'
        ? 'failed'
        : 'pending';
  const config = statusConfig[status];
  const Icon = config.icon;

  useEffect(() => {
    if (status === 'success') clearCart();
  }, [status, clearCart]);

  if (!orderId) {
    return <div className="py-16 text-center">Не указан номер заказа.</div>;
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="mx-auto max-w-md space-y-6 text-center">
        <Icon className={`mx-auto size-16 ${config.color}`} />
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">{config.title}</h1>
          <p className="text-sm text-muted-foreground">
            {query.isError
              ? 'Не удалось проверить платёж. Обновите страницу через несколько секунд.'
              : config.description}
          </p>
          <p className="text-sm text-muted-foreground">
            Номер заказа: <span className="font-medium text-foreground">{orderId}</span>
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          {status === 'failed' ? (
            <Button asChild variant="accent">
              <Link to="/checkout">Вернуться к оформлению</Link>
            </Button>
          ) : accessToken ? (
            <Button asChild variant="accent"><Link to="/profile">Мои заказы</Link></Button>
          ) : (
            <Button asChild variant="accent"><Link to="/market/catalog">Вернуться в каталог</Link></Button>
          )}
          <Button asChild variant="secondary"><Link to="/">На главную</Link></Button>
        </div>
      </div>
    </div>
  );
}
