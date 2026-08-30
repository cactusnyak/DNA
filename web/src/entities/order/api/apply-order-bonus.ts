import { httpClient } from '@/shared/api/http-client';

export type ApplyOrderBonusResponse = {
  requestedAmount: number;
  appliedAmount: number;
  maximumAmount: number;
  availableBalance: number;
  merchandiseSubtotal: number;
  deliveryAmount: number;
  externalPaymentAmount: number;
  pricingVersion: number;
};

export function applyOrderBonus(accessToken: string, orderId: string, requestedAmount: number) {
  return httpClient<ApplyOrderBonusResponse, { requestedAmount: number }>(
    `/rewards/orders/${orderId}/bonus`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: { requestedAmount },
    },
  );
}
