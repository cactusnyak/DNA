import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { useCartStore } from '@/entities/cart';
import { useAuthStore } from '@/entities/auth';
import { getPaymentStatus } from '@/entities/order';
import { useSessionStore } from '@/entities/session';
import { StateCard } from '@/components/ui/StateCard';

import {
  checkoutResultStatusConfig,
  type CheckoutResultStatus,
} from './data/checkoutResultStatus';

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

  const status: CheckoutResultStatus =
    query.data?.paymentStatus === 'succeeded'
      ? 'success'
      : query.data?.paymentStatus === 'canceled'
        ? 'failed'
        : 'pending';
  const config = checkoutResultStatusConfig[status];

  useEffect(() => {
    if (status === 'success') clearCart();
  }, [status, clearCart]);

  if (!orderId) {
    return <div className="py-16 text-center">Не указан номер заказа.</div>;
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <StateCard
        className="max-w-md"
        icon={config.icon}
        iconClassName={config.color}
        title={config.title}
        description={
          <div className="space-y-2">
            <p>
              {query.isError
                ? 'Не удалось проверить платёж. Обновите страницу через несколько секунд.'
                : config.description}
            </p>
            <p>
              Номер заказа:{' '}
              <span className="font-medium text-foreground">{orderId}</span>
            </p>
          </div>
        }
        actions={[
          status === 'failed'
            ? { label: 'Вернуться к оформлению', to: '/checkout' }
            : accessToken
              ? { label: 'Мои заказы', to: '/profile' }
              : { label: 'Вернуться в каталог', to: '/market/catalog' },
          { label: 'На главную', to: '/', variant: 'secondary' },
        ]}
      />
    </div>
  );
}
