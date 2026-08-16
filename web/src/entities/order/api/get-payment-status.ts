import { httpClient } from '@/shared/api/http-client';

export type PaymentStatusResponse = {
  paymentId: string | null;
  paymentStatus: 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled' | null;
  orderStatus: string;
};

export function getPaymentStatus(
  orderId: string,
  accessToken?: string,
  guestSessionId?: string,
) {
  return httpClient<PaymentStatusResponse>(`/orders/${orderId}/payment`, {
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(guestSessionId ? { 'X-Guest-Session-Id': guestSessionId } : {}),
    },
  });
}
