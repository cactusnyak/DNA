import type { Currency } from './currency';

export type Balance = {
  value: number;
  pendingRewardValue: number;
  spendingHoldValue: number;
  debtValue: number;
  currency: Currency;
};
