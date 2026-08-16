import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';

import { ContentCard } from '@/components/ui/ContentCard';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useAuthStore } from '@/entities/auth';
import { getOrder } from '@/entities/order';
import { Checkout } from '@/features/checkout';
import { CheckoutPaymentState } from '@/features/checkout/components/CheckoutPaymentState/CheckoutPaymentState';

export function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId')?.trim() ?? '';
  const accessToken = useAuthStore((state) => state.accessToken) ?? '';
  const orderQuery = useQuery({
    queryKey: ['my-order', orderId, accessToken],
    queryFn: () => getOrder(accessToken, orderId),
    enabled: Boolean(orderId && accessToken),
  });

  if (orderId) {
    if (!accessToken) {
      return <ContentCard><ErrorMessage>Войдите в профиль, чтобы продолжить оплату заказа.</ErrorMessage><Link to="/authorization" className="mt-4 inline-block underline">Войти</Link></ContentCard>;
    }
    if (orderQuery.isPending) return <ContentCard>Загружаем заказ…</ContentCard>;
    if (orderQuery.isError || !orderQuery.data) {
      return <ContentCard><ErrorMessage>Заказ не найден или недоступен.</ErrorMessage><Link to="/profile" className="mt-4 inline-block underline">Вернуться в профиль</Link></ContentCard>;
    }
    if (orderQuery.data.status !== 'AWAITING_PAYMENT') {
      return <ContentCard><p>Этот заказ больше не ожидает оплаты.</p><Link to={`/orders/${orderId}`} className="mt-4 inline-block underline">Открыть заказ</Link></ContentCard>;
    }
    return <CheckoutPaymentState order={orderQuery.data} />;
  }

  return <Checkout />;
}
