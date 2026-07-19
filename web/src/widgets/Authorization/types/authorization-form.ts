export type AuthorizationMode = 'login' | 'register';

export type AuthorizationFormValue = {
  email: string;
  password: string;
  nickname: string;
  phone: string;
  inviterReferralCode: string;
};