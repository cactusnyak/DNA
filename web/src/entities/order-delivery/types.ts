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

export type DeliveryOption = {
  quoteId: string;
  serviceCode: string;
  title: string;
  description?: string;
  fulfillmentType: 'DOOR' | 'PICKUP';
  customerPrice: number;
  currency: 'RUB';
  pickupInterval?: { from: string; to: string };
  deliveryInterval?: { from: string; to: string };
  expiresAt: string;
};

export type DeliveryProviderOptions = {
  code: string;
  name: string;
  options: DeliveryOption[];
  unavailableReason?: { code: string; message: string; retriable?: boolean };
};

export type OrderDeliveryGroup = {
  groupKey: string;
  warehouse: { id: string; name: string };
  items: Array<{ orderItemId: string; title: string; quantity: number }>;
  providers: DeliveryProviderOptions[];
  selectedQuote: DeliveryOption | null;
  readiness: { status: 'QUOTE_REQUIRED' | 'SELECTION_REQUIRED' | 'SELECTED' };
};

export type OrderDeliveryState = {
  status: 'ADDRESS_REQUIRED' | 'READY_FOR_QUOTE' | 'QUOTING' | 'SELECTION_REQUIRED' | 'READY_FOR_PAYMENT' | 'BLOCKED';
  destination: OrderDeliveryDestination | null;
  groups: OrderDeliveryGroup[];
  unavailableItems: Array<{ orderItemId: string; title: string; quantity: number; code: string; message: string }>;
  pricing: {
    itemsSubtotal: number;
    oversizedDeliveryAmount: number;
    automatedDeliveryAmount: number;
    deliveryAmount: number;
    totalAmount: number;
    currency: 'RUB';
    version: number;
  };
  readyForPayment: boolean;
  blockingReasons: string[];
};

export type DeliveryCredentials = { accessToken?: string; guestSessionId?: string };
export type UpdateDestinationPayload = Omit<OrderDeliveryDestination, 'version'>;
