import { calculateOrderPricing } from './order-delivery-pricing';

describe('calculateOrderPricing', () => {
  it('calculates items without delivery', () => {
    expect(
      calculateOrderPricing(
        [{ unitPrice: 100, quantity: 2, isOversized: false, deliveryPrice: 0 }],
        [],
      ).totalAmount,
    ).toBe(200);
  });

  it('adds automated delivery groups', () => {
    expect(
      calculateOrderPricing(
        [{ unitPrice: 100, quantity: 1, isOversized: false, deliveryPrice: 0 }],
        [20, 30],
      ),
    ).toMatchObject({ automatedDeliveryAmount: 50, totalAmount: 150 });
  });

  it('adds oversized delivery only for oversized items', () => {
    expect(
      calculateOrderPricing(
        [
          { unitPrice: 100, quantity: 1, isOversized: true, deliveryPrice: 40 },
          {
            unitPrice: 50,
            quantity: 1,
            isOversized: false,
            deliveryPrice: 999,
          },
        ],
        [],
      ),
    ).toMatchObject({ oversizedDeliveryAmount: 40, totalAmount: 190 });
  });

  it('does not double count mixed delivery', () => {
    expect(
      calculateOrderPricing(
        [
          { unitPrice: 100, quantity: 1, isOversized: true, deliveryPrice: 40 },
          { unitPrice: 200, quantity: 1, isOversized: false, deliveryPrice: 0 },
        ],
        [60],
      ),
    ).toEqual({
      itemsSubtotal: 300,
      oversizedDeliveryAmount: 40,
      automatedDeliveryAmount: 60,
      deliveryAmount: 100,
      totalAmount: 400,
    });
  });
});
