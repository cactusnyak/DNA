import { httpClient } from '@/shared/api/http-client';

export type InitiatePaymentResponse = {
  paymentId: string;
  confirmationToken: string | null;
  status: string;
};

export function initiatePayment(
  orderId: string,
  accessToken?: string,
  guestSessionId?: string,
): Promise<InitiatePaymentResponse> {
  return httpClient<InitiatePaymentResponse>(`/orders/${orderId}/payment`, {
    method: 'POST',
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(guestSessionId ? { 'X-Guest-Session-Id': guestSessionId } : {}),
    },
  });
}
