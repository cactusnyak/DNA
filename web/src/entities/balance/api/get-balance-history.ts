import { httpClient } from '@/shared/api/http-client';

export type BalanceOperation = {
  id: string;
  orderId?: string | null;
  type: string;
  amount: number;
  activeDelta: number;
  pendingDelta: number;
  holdDelta: number;
  debtDelta: number;
  createdAt: string;
};

export function getBalanceHistory(accessToken: string, page = 1) {
  return httpClient<{ items: BalanceOperation[]; page: number; pageSize: number; total: number }>(
    `/rewards/history?page=${page}&pageSize=25`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
}
