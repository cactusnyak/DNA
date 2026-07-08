import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { useMutation } from '@tanstack/react-query';

import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/entities/auth';
import { initiatePayment, type Order } from '@/entities/order';
import { formatPrice } from '@/shared/utils/format-price';

declare global {
  interface Window {
    YooMoneyCheckoutWidget: new (options: {
      confirmation_token: string;
      return_url: string;
      error_callback: (error: unknown) => void;
    }) => {
      render: (elementId: string) => void;
      destroy: () => void;
    };
  }
}

type CheckoutPaymentStateProps = {
  order: Order;
};

type PaymentStage = 'idle' | 'loading' | 'widget' | 'error';

export function CheckoutPaymentState({ order }: CheckoutPaymentStateProps) {
  const [stage, setStage] = useState<PaymentStage>('idle');
  const [errorMessage, setErrorMessage] = useState<string>();
  const widgetRef = useRef<{ destroy: () => void } | null>(null);
  const accessToken = useAuthStore((state) => state.accessToken);

  const initiateMutation = useMutation({
    mutationFn: () => initiatePayment(order.id, accessToken ?? undefined),
    onSuccess: (data) => {
      if (!data.confirmationToken) {
        setErrorMessage('Не удалось получить токен оплаты от ЮKassa.');
        setStage('error');
        return;
      }

      loadWidget(data.confirmationToken);
    },
    onError: () => {
      setErrorMessage('Не удалось инициировать платёж. Попробуйте ещё раз.');
      setStage('error');
    },
  });

  function loadWidget(confirmationToken: string) {
    setStage('loading');

    const scriptId = 'yookassa-checkout-js';

    function mountWidget() {
      const widget = new window.YooMoneyCheckoutWidget({
        confirmation_token: confirmationToken,
        return_url: `${window.location.origin}/checkout/result?orderId=${order.id}`,
        error_callback: () => {
          setErrorMessage('Ошибка платёжного виджета. Попробуйте ещё раз.');
          setStage('error');
        },
      });

      widget.render('yookassa-widget-container');
      widgetRef.current = widget;
      setStage('widget');
    }

    if (document.getElementById(scriptId)) {
      mountWidget();
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://yookassa.ru/checkout-widget/v1/checkout-widget.js';
    script.onload = mountWidget;
    script.onerror = () => {
      setErrorMessage('Не удалось загрузить платёжный виджет.');
      setStage('error');
    };
    document.head.appendChild(script);
  }

  useEffect(() => {
    return () => {
      widgetRef.current?.destroy();
    };
  }, []);

  return (
    <section className="mx-auto max-w-2xl space-y-6 rounded-2xl border border-border bg-card p-8">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          Заказ оформлен
        </p>

        <h1 className="text-2xl font-semibold">Осталось оплатить заказ</h1>

        <p className="text-sm text-muted-foreground">
          Номер заказа: <span className="text-foreground">{order.id}</span>
        </p>
      </div>

      <table className="w-full text-sm">
        <tbody>
          <tr className="border-b border-border">
            <td className="py-3 text-muted-foreground">Сумма к оплате</td>
            <td className="py-3 text-right text-lg font-semibold">
              {formatPrice(order.totalAmount)}
            </td>
          </tr>
          <tr>
            <td className="py-3 text-muted-foreground">Статус</td>
            <td className="py-3 text-right font-medium">Ожидает оплаты</td>
          </tr>
        </tbody>
      </table>

      {stage === 'error' && errorMessage && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </p>
      )}

      {stage === 'widget' && (
        <div id="yookassa-widget-container" className="min-h-[300px]" />
      )}

      {stage !== 'widget' && (
        <p className="text-sm text-muted-foreground">
          После оплаты заказ будет передан в обработку. Если оплата не будет
          совершена в течение 30 минут, заказ будет автоматически отменён.
        </p>
      )}

      {stage !== 'widget' && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={() => initiateMutation.mutate()}
            disabled={initiateMutation.isPending || stage === 'loading'}
          >
            {initiateMutation.isPending || stage === 'loading'
              ? 'Загрузка...'
              : 'Оплатить заказ'}
          </Button>

          <Button asChild variant="outline">
            <Link to="/market/catalog">Вернуться в каталог</Link>
          </Button>
        </div>
      )}
    </section>
  );
}
