import type { DeliveryQuote, DeliveryQuoteStatus } from './types';

export const quoteNeedsInvalidation = (status: DeliveryQuoteStatus) =>
  status === 'PENDING' || status === 'QUOTED' || status === 'ACCEPTED';

export const isQuoteReady = (
  quote: DeliveryQuote | undefined,
  cartLineKey: string,
  quantity: number,
) =>
  quote?.status === 'ACCEPTED' &&
  quote.cartLineKey === cartLineKey &&
  quote.quantity === quantity &&
  (!quote.expiresAt || new Date(quote.expiresAt).getTime() > Date.now());
