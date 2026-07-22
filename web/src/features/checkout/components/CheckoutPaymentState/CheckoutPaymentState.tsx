import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { useMutation } from '@tanstack/react-query';

import { Button } from '@/components/ui/Button';
import { LegalFormNotice } from '@/shared/legal/LegalFormNotice';
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
        setErrorMessage('Онлайн-оплата пока недоступна. Попробуйте позже.');
        setStage('error');
        return;
      }

      loadWidget(data.confirmationToken);
    },
    onError: () => {
      setErrorMessage('Онлайн-оплата пока недоступна. Попробуйте позже.');
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
          setErrorMessage('Не удалось открыть форму оплаты. Попробуйте позже.');
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
      setErrorMessage('Не удалось открыть форму оплаты. Попробуйте позже.');
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
          Заказ создан
        </p>

        <h1 className="text-2xl font-semibold">Заказ ожидает оплаты</h1>

        <p className="text-sm text-muted-foreground">
          Номер заказа: <span className="text-foreground">{order.id}</span>
        </p>
      </div>

      <table className="w-full text-sm">
        <tbody>
          <tr className="border-b border-border">
            <td className="py-3 text-muted-foreground">Дата заказа</td>
            <td className="py-3 text-right">{new Intl.DateTimeFormat('ru-RU', { dateStyle: 'long' }).format(new Date(order.createdAt))}</td>
          </tr>
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
          <tr className="border-t border-border">
            <td className="py-3 text-muted-foreground">Получатель</td>
            <td className="py-3 text-right">{order.customerName}, {order.customerPhone}</td>
          </tr>
          <tr className="border-t border-border">
            <td className="py-3 text-muted-foreground">Доставка</td>
            <td className="py-3 text-right">{order.deliveryAddress}</td>
          </tr>
          <tr className="border-t border-border">
            <td className="py-3 text-muted-foreground">Продавец и получатель оплаты</td>
            <td className="py-3 text-right">ИП Филатов Денис Романович</td>
          </tr>
        </tbody>
      </table>

      <div className="space-y-2">
        <h2 className="font-semibold">Состав заказа</h2>
        <ul className="space-y-2 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4">
              <span>{item.product?.title ?? `Товар ${item.productId}`} × {item.quantity}</span>
              <span className="shrink-0">{formatPrice(item.unitPrice * item.quantity)}</span>
            </li>
          ))}
        </ul>
      </div>

      {stage === 'error' && errorMessage && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </p>
      )}

      {stage === 'widget' && (
        <div className="space-y-3">
          <div id="yookassa-widget-container" className="min-h-[300px]" />
          <LegalFormNotice kind="order" />
        </div>
      )}

      {stage !== 'widget' && (
        <p className="text-sm text-muted-foreground">
          Онлайн-оплата пока находится в разработке и может быть недоступна.
          Сохраните номер заказа, чтобы уточнить его статус.
        </p>
      )}

      <p className="text-xs text-muted-foreground">К заказу применяется <Link className="font-medium text-foreground underline underline-offset-2" to="/public-offer">Публичная оферта</Link>.</p>

      {stage !== 'widget' && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={() => initiateMutation.mutate()}
            disabled={initiateMutation.isPending || stage === 'loading'}
          >
            {initiateMutation.isPending || stage === 'loading'
              ? 'Открываем оплату...'
              : 'Проверить доступность оплаты'}
          </Button>

          <Button asChild variant="outline">
            <Link to="/market/catalog">Вернуться в каталог</Link>
          </Button>
        </div>
      )}
    </section>
  );
}
