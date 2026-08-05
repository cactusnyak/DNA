export type DeliveryQuoteStatus = 'PENDING' | 'QUOTED' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';
export type DeliveryQuote = {
  id: string; productId: string; quantity: number; status: DeliveryQuoteStatus;
  destinationRegion: string; destinationCity: string; destinationAddress: string;
  confirmedDeliveryPrice?: number | null; managerComment?: string | null;
  expiresAt?: string | null; createdAt: string;
};
export type CreateDeliveryQuotePayload = {
  productId: string; guestSessionId: string; clientRequestId: string; quantity: number;
  destinationRegion: string; destinationCity: string; destinationAddress: string;
  customerName: string; customerPhone: string; customerEmail?: string;
  customerComment?: string; unloadingRequired: boolean; accessRestrictions?: string;
};
