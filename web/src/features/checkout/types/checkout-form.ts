import type { AddressSuggestion } from '@/entities/order-delivery';

export type CheckoutFormValue = {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: string;
  deliveryDestination?: AddressSuggestion;
};
