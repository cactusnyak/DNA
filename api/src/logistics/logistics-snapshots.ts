/**
 * Versioned, provider-neutral JSON contracts persisted by DeliveryQuote and
 * Shipment. They intentionally exclude provider responses, credentials and
 * authorization headers. Services creating quotes/shipments must validate these
 * objects before persistence and must never log address/contact snapshots.
 */
export type LogisticsOriginSnapshotV1 = {
  version: 1;
  warehouseCode: string;
  address: {
    country: string;
    region?: string;
    city: string;
    street: string;
    building: string;
    postalCode?: string;
    fullAddress: string;
    latitude?: number;
    longitude?: number;
  };
  contact: { name: string; phone: string; email?: string };
  timezone: string;
};

export type LogisticsDestinationSnapshotV1 = {
  version: 1;
  address: {
    country: string;
    region?: string;
    city: string;
    street: string;
    building: string;
    apartment?: string;
    postalCode?: string;
    fullAddress: string;
    latitude?: number;
    longitude?: number;
  };
  recipient: { name: string; phone: string; email?: string };
};

export type LogisticsCargoSnapshotV1 = {
  version: 1;
  items: Array<{
    orderItemId?: string;
    productId: string;
    sku?: string;
    quantity: number;
    packagesPerUnit: Array<{
      sequence: number;
      type: 'BOX' | 'PALLET' | 'ENVELOPE' | 'CRATE' | 'OTHER';
      quantity: number;
      weightGrams: number;
      lengthMillimeters: number;
      widthMillimeters: number;
      heightMillimeters: number;
    }>;
    // Reserved for immutable effects of selected additions in a later stage.
    additionModifiers?: unknown[];
  }>;
};

export type LogisticsServiceSnapshotV1 = {
  version: 1;
  providerCode: string;
  serviceCode: string;
  serviceName: string;
  providerOfferCode?: string;
};
