export type AuthorizationMode = 'login' | 'register';

export type AuthorizationFormMethod = 'email' | 'otp';

export type AuthorizationFormValue = {
  login: string;
  password: string;
  nickname: string;
  otpCode: string;
  inviterReferralCode: string;
};