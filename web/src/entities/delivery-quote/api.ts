import { httpClient } from '@/shared/api/http-client';
import type { CreateDeliveryQuotePayload, DeliveryQuote } from './types';
const headers = (token?: string) => token ? { Authorization: `Bearer ${token}` } : undefined;
export const createDeliveryQuote = (body: CreateDeliveryQuotePayload, token?: string) => httpClient<DeliveryQuote, CreateDeliveryQuotePayload>('/delivery-quotes', { method: 'POST', body, headers: headers(token) });
export const getDeliveryQuote = (id: string, guestSessionId: string, token?: string) => httpClient<DeliveryQuote>(`/delivery-quotes/${id}`, { query: { guestSessionId }, headers: headers(token) });
export const acceptDeliveryQuote = (id: string, guestSessionId: string, token?: string) => httpClient<DeliveryQuote, { guestSessionId: string }>(`/delivery-quotes/${id}/accept`, { method: 'POST', body: { guestSessionId }, headers: headers(token) });
