export type DeliveryPricingItem = {
  unitPrice: number;
  quantity: number;
  isOversized: boolean;
  deliveryPrice: number;
};

export function calculateOrderPricing(
  items: DeliveryPricingItem[],
  automatedCharges: number[],
) {
  const itemsSubtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const oversizedDeliveryAmount = items
    .filter((item) => item.isOversized)
    .reduce((sum, item) => sum + item.deliveryPrice, 0);
  const automatedDeliveryAmount = automatedCharges.reduce(
    (sum, amount) => sum + amount,
    0,
  );
  const deliveryAmount = oversizedDeliveryAmount + automatedDeliveryAmount;
  return {
    itemsSubtotal,
    oversizedDeliveryAmount,
    automatedDeliveryAmount,
    deliveryAmount,
    totalAmount: itemsSubtotal + deliveryAmount,
  };
}
