import type { CartStoreItem } from '@/entities/cart';
import type { CreateOrderPayload } from '@/entities/order';
import { isQuoteReady } from '@/entities/delivery-quote';

import type { CheckoutFormValue } from '../types/checkout-form';

type BuildCreateOrderPayloadParams = {
  formValue: CheckoutFormValue;
  items: CartStoreItem[];
  guestSessionId: string;
};

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
    items: items.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      selectedAdditions: item.selectedAdditions ?? [],
      deliveryQuoteId: isQuoteReady(
        item.deliveryQuote,
        item.configurationKey,
        item.quantity,
      )
        ? item.deliveryQuote?.id
        : undefined,
    })),
  };
}
