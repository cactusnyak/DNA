export type DeliveryCapability = {
  quoteCalculation: boolean;
  doorDelivery: boolean;
  pickupDelivery: boolean;
  scheduledIntervals: boolean;
  liveOrderCreation: boolean;
  cancellation: boolean;
  tracking: boolean;
  statusPolling: boolean;
  callbacks: boolean;
};

export type DeliveryAddress = {
  country: string;
  region?: string;
  city: string;
  street?: string;
  building?: string;
  fullAddress: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
};

export type DeliveryPackage = {
  orderItemId: string;
  productId: string;
  sku?: string;
  quantity: number;
  packageSequence: number;
  type: 'BOX' | 'PALLET' | 'ENVELOPE' | 'CRATE' | 'OTHER';
  weightGrams: number;
  lengthMillimeters: number;
  widthMillimeters: number;
  heightMillimeters: number;
};

export type DeliveryQuoteRequest = {
  correlationId: string;
  groupKey: string;
  serviceCodes: string[];
  warehouseExternalLocationId?: string;
  warehouseProviderMetadata?: unknown;
  origin: DeliveryAddress & { contactName: string; contactPhone: string };
  destination: DeliveryAddress & {
    recipientName: string;
    recipientPhone: string;
    recipientEmail?: string;
  };
  packages: DeliveryPackage[];
  externalPickupPointId?: string;
};

export type DeliveryQuoteOption = {
  serviceCode: string;
  title: string;
  description?: string;
  fulfillmentType: 'DOOR' | 'PICKUP';
  providerCost: number;
  currency: 'RUB';
  pickupInterval?: { from: string; to: string };
  deliveryInterval?: { from: string; to: string };
  expiresAt: Date;
  pickupPoint?: {
    externalId: string;
    name: string;
    address: string;
    coordinates?: { latitude: number; longitude: number };
  };
  providerOfferRef?: string;
  privateProviderPayload?: unknown;
  rawProviderPrice: unknown;
  contour: string;
  mode: string;
};

export interface DeliveryProviderAdapter {
  readonly providerCode: string;
  getCapabilities(): DeliveryCapability;
  calculateQuotes(
    request: DeliveryQuoteRequest,
  ): Promise<DeliveryQuoteOption[]>;
}

export type DeliveryUnavailableReason = {
  code: string;
  message: string;
  retriable?: boolean;
};
