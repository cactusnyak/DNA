export type ReferralTreeUser = {
  id: string;
  nickname: string;
  nicknameSuffix?: string;
  referralCode?: string;
  level: number;
  invitedAt: string;
  children: ReferralTreeUser[];
};