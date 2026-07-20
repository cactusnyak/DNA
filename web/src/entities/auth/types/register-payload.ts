export type RegisterPayload = {
  login: string;
  password: string;
  nickname: string;
  inviterReferralCode?: string;
};