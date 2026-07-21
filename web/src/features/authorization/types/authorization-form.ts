export type AuthorizationMode = 'login' | 'register';

export type AuthorizationFormValue = {
  login: string;
  nickname: string;
  otpCode: string;
  inviterReferralCode: string;
};