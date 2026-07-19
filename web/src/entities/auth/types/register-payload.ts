export type RegisterPayload = {
  email: string;
  password: string;
  nickname: string;
  phone?: string;
  inviterReferralCode?: string;
};