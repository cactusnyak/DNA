import { httpClient } from '@/shared/api/http-client';

export type RewardConfiguration = {
  version: number;
  moneyUnit: 'WHOLE_RUB';
  maxBonusPaymentPercent: number;
  levels: Array<{ id: string; depth: number; name: string; configVersion: number }>;
};

export function getAdminRewardConfiguration(accessToken: string) {
  return httpClient<RewardConfiguration>('/admin/rewards/configuration', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export type AdminRewardPreview = {
  rewardBudget: number;
  grossProfit: number;
  marginBasisPoints: number;
  coefficientBasisPoints: number;
  distributions: Array<{ depth: number; shareBasisPoints: number; amount: number }>;
};

export function getAdminRewardPreview(
  accessToken: string,
  payload: {
    price: number;
    costBasis: number | null;
    rewardEnabled: boolean;
    shares: Array<{ depth: number; shareBasisPoints: number }>;
  },
) {
  return httpClient<AdminRewardPreview, typeof payload>('/admin/rewards/preview', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: payload,
  });
}
