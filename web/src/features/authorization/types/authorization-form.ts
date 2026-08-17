export type AuthorizationMode = 'login' | 'register';

export type AuthorizationFormMethod = 'email_password' | 'email_otp' | 'otp';

export type AuthorizationFormValue = {
  login: string;
  password: string;
  nickname: string;
  otpCode: string;
  inviterReferralCode: string;
};
