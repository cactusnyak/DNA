import type { AdminQuote, AdminQuoteDraft } from '../types/admin-delivery-quotes';

export function getAdminQuoteDraft(quote: AdminQuote): AdminQuoteDraft {
  return {
    price: quote.confirmedDeliveryPrice?.toString() ?? '',
    comment: quote.managerComment ?? '',
    expiresAt: quote.expiresAt?.slice(0, 16) ?? '',
  };
}
