import type { ReactNode } from 'react';
import type { DeliveryQuote, DeliveryQuoteStatus } from '@/entities/delivery-quote';

export type AdminDeliveryQuotesProps = { accessToken: string };

export type AdminQuote = DeliveryQuote & {
  product: { title: string };
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerComment?: string;
  accessRestrictions?: string;
  unloadingRequired: boolean;
};

export type AdminQuoteDraft = { price: string; comment: string; expiresAt: string };
export type AdminQuoteDrafts = Record<string, AdminQuoteDraft>;
export type UpdateAdminQuoteVariables = { id: string; status: DeliveryQuoteStatus };
export type InfoTableRow = { label: string; value: ReactNode };
export type AdminDeliveryQuotesDateRange = { from: string; to: string };
