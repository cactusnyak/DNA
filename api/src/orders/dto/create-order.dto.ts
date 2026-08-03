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
  comment?: string;
  items?: CreateOrderItemDto[];
};
