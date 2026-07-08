import { httpClient } from '@/shared/api/http-client';

export type AdminReferralUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  role: string;
  referralCode?: string | null;
  createdAt: string;
  invitedBy: string | null;
  directReferralsCount: number;
  directReferrals: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    isDeleted: boolean;
    joinedAt: string;
  }[];
};

export function getAdminReferrals(accessToken: string): Promise<AdminReferralUser[]> {
  return httpClient<AdminReferralUser[]>('/admin/referrals', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
