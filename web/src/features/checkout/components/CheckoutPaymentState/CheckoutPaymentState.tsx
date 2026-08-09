import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { useMutation } from '@tanstack/react-query';

import { LegalFormNotice } from '@/shared/legal/LegalFormNotice';
import { useAuthStore } from '@/entities/auth';
import { initiatePayment, type Order } from '@/entities/order';
import { useSessionStore } from '@/entities/session';

import { OrderDetailsTable } from './components/OrderDetailsTable';
import { OrderItemsList } from './components/OrderItemsList';
import { PaymentActions } from './components/PaymentActions';

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
  const guestSessionId = useSessionStore((state) => state.guestSessionId);

  const initiateMutation = useMutation({
    mutationFn: () =>
      initiatePayment(
        order.id,
        accessToken ?? undefined,
        accessToken ? undefined : guestSessionId,
      ),
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
    <section className="mx-auto max-w-2xl space-y-6 rounded-2xl shadow-card-xl bg-card p-8">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          Заказ создан
        </p>

        <h1 className="text-2xl font-semibold">Заказ ожидает оплаты</h1>

        <p className="text-sm text-muted-foreground">
          Номер заказа: <span className="text-foreground">{order.id}</span>
        </p>
      </div>

      <OrderDetailsTable order={order} />

      <OrderItemsList items={order.items} />

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
          После оплаты мы автоматически проверим её статус. Не закрывайте
          страницу банка до завершения операции.
        </p>
      )}

      <p className="text-xs text-muted-foreground">К заказу применяется <Link className="font-medium text-foreground underline underline-offset-2" to="/public-offer">Публичная оферта</Link>.</p>

      {stage !== 'widget' && (
        <PaymentActions
          isPending={initiateMutation.isPending || stage === 'loading'}
          isRetry={stage === 'error'}
          onPay={() => initiateMutation.mutate()}
        />
      )}
    </section>
  );
}
