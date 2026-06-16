export type ReferralTreeUser = {
  id: string;
  firstName: string;
  lastName: string;
  referralCode?: string;
  level: number;
  invitedAt: string;
  children: ReferralTreeUser[];
};