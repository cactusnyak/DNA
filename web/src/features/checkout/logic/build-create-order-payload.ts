import type { CartStoreItem } from '@/entities/cart';
import type { CreateOrderPayload } from '@/entities/order';

import type { CheckoutFormValue } from '../types/checkout-form';

type BuildCreateOrderPayloadParams = {
  formValue: CheckoutFormValue;
  items: CartStoreItem[];
  guestSessionId: string;
};

function normalizeOptionalString(value: string) {
  const normalizedValue = value.trim();

  return normalizedValue || undefined;
}

export function buildCreateOrderPayload({
  formValue,
  items,
  guestSessionId,
}: BuildCreateOrderPayloadParams): CreateOrderPayload {
  return {
    guestSessionId,
    customerName: formValue.customerName.trim(),
    customerPhone: formValue.customerPhone.trim(),
    customerEmail: formValue.customerEmail.trim(),
    deliveryAddress: formValue.deliveryAddress.trim(),
    comment: normalizeOptionalString(formValue.comment),
    items: items.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      selectedAdditions: item.selectedAdditions ?? [],
      deliveryQuoteId: item.deliveryQuote?.status === 'ACCEPTED' ? item.deliveryQuote.id : undefined,
    })),
  };
}
