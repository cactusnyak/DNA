import type { CheckoutFormValue } from '../types/checkout-form';

export function isCheckoutFormValid(value: CheckoutFormValue) {
  return Boolean(
    value.customerName.trim() &&
      value.customerPhone.trim() &&
      value.deliveryAddress.trim(),
  );
}