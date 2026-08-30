export type OrderDeliveryDestination = {
  country: string;
  region?: string;
  city: string;
  street?: string;
  building?: string;
  apartment?: string;
  postalCode?: string;
  fullAddress: string;
  latitude?: number;
  longitude?: number;
  externalLocationId?: string;
  recipientName: string;
  recipientPhone: string;
  recipientEmail?: string;
  version: number;
};

export type DeliveryInterval = { from: string; to: string };

export type DeliveryPlan = {
  planId: string;
  title: string;
  badges: Array<'RECOMMENDED' | 'CHEAPEST' | 'FASTEST'>;
  customerPrice: number;
  currency: 'RUB';
  deliveryInterval?: DeliveryInterval;
  shipmentCount: number;
  expiresAt: string;
  parts: Array<{
    partId: string;
    items: Array<{
      orderItemId: string;
      title: string;
      quantity: number;
      image?: unknown;
    }>;
    provider: { code: string; name: string };
    service: {
      code: string;
      name: string;
      fulfillmentType: 'DOOR' | 'PICKUP';
    };
    deliveryInterval?: DeliveryInterval;
  }>;
};

export type DeliveryOption = {
  title: string;
  description?: string;
  fulfillmentType: 'DOOR' | 'PICKUP';
  customerPrice: number;
  currency: 'RUB';
  pickupInterval?: { from: string; to: string };
  deliveryInterval?: { from: string; to: string };
  expiresAt: string;
};

export type OrderDeliveryState = {
  status:
    | 'ADDRESS_REQUIRED'
    | 'READY_FOR_QUOTE'
    | 'QUOTING'
    | 'SELECTION_REQUIRED'
    | 'READY_FOR_PAYMENT'
    | 'BLOCKED';
  destination: OrderDeliveryDestination | null;
  plans: DeliveryPlan[];
  selectedPlanId: string | null;
  unavailableItems: Array<{
    orderItemId: string;
    title: string;
    quantity: number;
    code: string;
    message: string;
    retriable: boolean;
  }>;
  pricing: {
    itemsSubtotal: number;
    oversizedDeliveryAmount: number;
    automatedDeliveryAmount: number;
    deliveryAmount: number;
    totalAmount: number;
    bonusDiscount: number;
    externalPaymentAmount: number;
    currency: 'RUB';
    version: number;
  };
  readyForPayment: boolean;
  blockingReasons: string[];
};

export type DeliveryCredentials = {
  accessToken?: string;
  guestSessionId?: string;
};
export type UpdateDestinationPayload = Omit<
  OrderDeliveryDestination,
  'version'
>;

export type AddressSuggestion = Omit<
  UpdateDestinationPayload,
  'recipientName' | 'recipientPhone' | 'recipientEmail'
> & {
  value: string;
};
