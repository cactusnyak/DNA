import type { SelectedProductAddition } from '../../products/product-additions';

export type CreateOrderItemDto = {
  productId: string;
  quantity: number;
  selectedAdditions?: SelectedProductAddition[];
  deliveryQuoteId?: string;
};

export type CreateOrderDto = {
  guestSessionId?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  deliveryAddress?: string;
  deliveryDestination?: {
    country?: string;
    region?: string;
    city?: string;
    street?: string;
    building?: string;
    apartment?: string;
    postalCode?: string;
    fullAddress?: string;
    latitude?: number;
    longitude?: number;
    externalLocationId?: string;
  };
  items?: CreateOrderItemDto[];
};
