import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { useMutation } from '@tanstack/react-query';

import { ErrorMessage } from '@/components/ui/ErrorMessage';
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

const WIDGET_SCRIPT_ID = 'yookassa-checkout-js';
const WIDGET_CONTAINER_ID = 'yookassa-widget-container';

function loadCheckoutWidgetScript() {
  if (window.YooMoneyCheckoutWidget) return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(
      WIDGET_SCRIPT_ID,
    ) as HTMLScriptElement | null;
    const script = existingScript ?? document.createElement('script');

    const handleLoad = () => {
      if (window.YooMoneyCheckoutWidget) resolve();
      else reject(new Error('YooKassa widget API is unavailable'));
    };
    const handleError = () => reject(new Error('Failed to load YooKassa widget'));

    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener('error', handleError, { once: true });

    if (!existingScript) {
      script.id = WIDGET_SCRIPT_ID;
      script.src = 'https://yookassa.ru/checkout-widget/v1/checkout-widget.js';
      document.head.appendChild(script);
    }
  });
}

export function CheckoutPaymentState({ order }: CheckoutPaymentStateProps) {
  const [stage, setStage] = useState<PaymentStage>('idle');
  const [confirmationToken, setConfirmationToken] = useState<string>();
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

      setErrorMessage(undefined);
      setConfirmationToken(data.confirmationToken);
      setStage('loading');
    },
    onError: () => {
      setErrorMessage('Онлайн-оплата пока недоступна. Попробуйте позже.');
      setStage('error');
    },
  });

  useEffect(() => {
    return () => {
      widgetRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (!confirmationToken || stage !== 'loading') return;

    let cancelled = false;

    void loadCheckoutWidgetScript()
      .then(() => {
        if (cancelled) return;
        if (!document.getElementById(WIDGET_CONTAINER_ID)) {
          throw new Error('YooKassa widget container is unavailable');
        }

        widgetRef.current?.destroy();
        const widget = new window.YooMoneyCheckoutWidget({
          confirmation_token: confirmationToken,
          return_url: `${window.location.origin}/checkout/result?orderId=${order.id}`,
          error_callback: () => {
            if (cancelled) return;
            setErrorMessage('Не удалось открыть форму оплаты. Попробуйте позже.');
            setStage('error');
          },
        });
        widgetRef.current = widget;
        widget.render(WIDGET_CONTAINER_ID);
        setStage('widget');
      })
      .catch(() => {
        if (cancelled) return;
        setErrorMessage('Не удалось открыть форму оплаты. Попробуйте позже.');
        setStage('error');
      });

    return () => {
      cancelled = true;
    };
  }, [confirmationToken, order.id, stage]);

  return (
<<<<<<< HEAD
    <section className="mx-auto max-w-2xl space-y-6 rounded-2xl shadow-card-xl bg-card p-8">
=======
    <section className="mx-auto max-w-2xl space-y-6 rounded-2xl border border-primary/12 bg-card p-8">
>>>>>>> origin/main
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
        <ErrorMessage>
          {errorMessage}
        </ErrorMessage>
      )}

      {(stage === 'loading' || stage === 'widget') && (
        <div className="space-y-3">
          <div id={WIDGET_CONTAINER_ID} className="min-h-[300px]" />
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
