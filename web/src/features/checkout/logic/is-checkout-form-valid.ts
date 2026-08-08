import type { CheckoutFormValue } from '../types/checkout-form';

export function isCheckoutFormValid(value: CheckoutFormValue) {
  return Boolean(
    value.customerName.trim() &&
      value.customerPhone.trim() &&
      /^\S+@\S+\.\S+$/.test(value.customerEmail.trim()) &&
      value.deliveryAddress.trim(),
  );
}
