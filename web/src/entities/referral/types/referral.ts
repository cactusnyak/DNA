import type { ReferralLevel } from '@/shared/types/referral-level';

export type Referral = {
  id: string;
  inviterUserId: string;
  invitedUserId: string;
  level: ReferralLevel;
  createdAt: string;
};