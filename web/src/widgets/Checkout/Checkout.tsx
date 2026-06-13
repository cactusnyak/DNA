import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import { SectionHeader } from '@/components/ui/Section';
import { useCartStore } from '@/entities/cart';
import { createOrder, type Order } from '@/entities/order';
import { useSessionStore } from '@/entities/session';

import { CheckoutCustomerForm } from './components/CheckoutCustomerForm';
import { CheckoutEmptyState } from './components/CheckoutEmptyState';
import { CheckoutOrderSummary } from './components/CheckoutOrderSummary';
import { CheckoutSuccessState } from './components/CheckoutSuccessState';
import { buildCreateOrderPayload } from './logic/build-create-order-payload';
import { initialCheckoutFormValue } from './logic/initial-checkout-form-value';
import type { CheckoutFormValue } from './types/checkout-form';

function isCheckoutFormValid(value: CheckoutFormValue) {
  return Boolean(
    value.customerName.trim() &&
    value.customerPhone.trim() &&
    value.deliveryAddress.trim(),
  );
}

export function Checkout() {
  const [formValue, setFormValue] = useState(initialCheckoutFormValue);
  const [createdOrder, setCreatedOrder] = useState<Order>();

  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const totalAmount = useCartStore((state) => state.getTotalAmount());

  const guestSessionId = useSessionStore((state) => state.guestSessionId);

  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => {
      clearCart();
      setCreatedOrder(order);
    },
  });

  if (createdOrder) {
    return <CheckoutSuccessState order={createdOrder} />;
  }

  if (!items.length) {
    return <CheckoutEmptyState />;
  }

  const isSubmitDisabled = !isCheckoutFormValid(formValue);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = buildCreateOrderPayload({
      formValue,
      items,
      guestSessionId,
    });

    createOrderMutation.mutate(payload);
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Оформление заказа"
        description="Покупку можно оформить без регистрации. Аккаунт понадобится только для профиля, истории, кешбэка и заработка."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <CheckoutCustomerForm
          value={formValue}
          isPending={createOrderMutation.isPending}
          isSubmitDisabled={isSubmitDisabled}
          errorMessage={
            createOrderMutation.isError
              ? 'Не удалось оформить заказ. Проверьте данные и попробуйте ещё раз.'
              : undefined
          }
          onChange={setFormValue}
          onSubmit={handleSubmit}
        />

        <CheckoutOrderSummary items={items} totalAmount={totalAmount} />
      </div>
    </div>
  );
}