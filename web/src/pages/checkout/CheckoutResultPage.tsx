import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

import { useCartStore } from '@/entities/cart';
import { Button } from '@/components/ui/Button';

type ResultStatus = 'success' | 'pending' | 'failed';

function getStatus(params: URLSearchParams): ResultStatus {
  const status = params.get('status');

  if (status === 'succeeded' || status === 'success') return 'success';
  if (status === 'canceled' || status === 'failed' || status === 'cancelled') return 'failed';

  return 'pending';
}

const statusConfig: Record<
  ResultStatus,
  { icon: typeof CheckCircle; color: string; title: string; description: string }
> = {
  success: {
    icon: CheckCircle,
    color: 'text-green-500',
    title: 'Оплата прошла успешно',
    description: 'Ваш заказ принят в обработку. Детали заказа доступны в профиле.',
  },
  pending: {
    icon: Clock,
    color: 'text-yellow-500',
    title: 'Платёж обрабатывается',
    description:
      'Мы ожидаем подтверждения от платёжной системы. Статус заказа обновится автоматически.',
  },
  failed: {
    icon: XCircle,
    color: 'text-destructive',
    title: 'Оплата не прошла',
    description:
      'Не удалось провести платёж. Попробуйте ещё раз или выберите другой способ оплаты.',
  },
};

export function CheckoutResultPage() {
  const [searchParams] = useSearchParams();
  const status = getStatus(searchParams);
  const config = statusConfig[status];
  const Icon = config.icon;

  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    if (status === 'success') {
      clearCart();
    }
  }, [status, clearCart]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="mx-auto max-w-md space-y-6 text-center">
        <Icon className={`mx-auto size-16 ${config.color}`} />

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">{config.title}</h1>
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          {status === 'failed' ? (
            <Button asChild>
              <Link to="/checkout">Вернуться к оформлению</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link to="/profile">Мои заказы</Link>
            </Button>
          )}

          <Button asChild variant="outline">
            <Link to="/">На главную</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
