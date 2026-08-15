import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { SectionHeader } from '@/components/ui/Section';
import { ContentCard } from '@/components/ui/ContentCard';
import { useAuthStore } from '@/entities/auth';
import { useCartStore } from '@/entities/cart';
import { isQuoteReady } from '@/entities/delivery-quote';
import {
  createOrder,
  type CreateOrderPayload,
  type Order,
} from '@/entities/order';
import { useSessionStore } from '@/entities/session';

import { CheckoutCustomerForm } from './components/CheckoutCustomerForm';
import { CheckoutEmptyState } from './components/CheckoutEmptyState';
import { CheckoutOrderSummary } from './components/CheckoutOrderSummary';
import { CheckoutPaymentState } from './components/CheckoutPaymentState';
import { buildCreateOrderPayload } from './logic/build-create-order-payload';
import { initialCheckoutFormValue } from './logic/initial-checkout-form-value';
import { isCheckoutFormValid } from './logic/is-checkout-form-valid';

import type { CheckoutFormValue } from './types/checkout-form';

export function Checkout() {
  const checkoutPrefill = useCartStore((state) => state.checkoutPrefill);
  const [formValue, setFormValue] = useState<CheckoutFormValue>(
    checkoutPrefill ?? initialCheckoutFormValue,
  );
  const [createdOrder, setCreatedOrder] = useState<Order>();

  const accessToken = useAuthStore((state) => state.accessToken);

  const items = useCartStore((state) => state.items);
  const totalAmount = useCartStore((state) => state.getTotalAmount());
  const unresolvedOversizedItems = items.filter(
    (item) =>
      item.product.isOversized &&
      !isQuoteReady(item.deliveryQuote, item.configurationKey, item.quantity),
  );

  const guestSessionId = useSessionStore((state) => state.guestSessionId);

  const createOrderMutation = useMutation({
    mutationFn: (payload: CreateOrderPayload) => {
      return createOrder(payload, accessToken);
    },
    onSuccess: (order) => {
      setCreatedOrder(order);
    },
  });

  if (createdOrder) {
    return <CheckoutPaymentState order={createdOrder} />;
  }

  if (!items.length) {
    return <CheckoutEmptyState />;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    createOrderMutation.mutate(
      buildCreateOrderPayload({
        formValue,
        items,
        guestSessionId,
      }),
    );
  }

  return (
    <ContentCard>
      <SectionHeader
        title="Оформление заказа"
        description="Заказ в Маркете можно оформить без регистрации. Заказы, созданные после входа, сохраняются в истории профиля. Онлайн-оплата и доставка пока находятся в разработке."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <CheckoutCustomerForm
          value={formValue}
          isPending={createOrderMutation.isPending}
          isSubmitDisabled={
            !isCheckoutFormValid(formValue) ||
            unresolvedOversizedItems.length > 0
          }
          errorMessage={
            createOrderMutation.isError
              ? 'Не удалось оформить заказ. Проверьте данные и попробуйте ещё раз.'
              : undefined
          }
          onChange={setFormValue}
          onSubmit={handleSubmit}
        />
        {unresolvedOversizedItems.length > 0 && (
          <ErrorMessage role="alert">
            Для крупногабаритных товаров сначала примите подтверждённый расчёт
            доставки.
          </ErrorMessage>
        )}

        <CheckoutOrderSummary items={items} totalAmount={totalAmount} />
      </div>
    </ContentCard>
  );
}
