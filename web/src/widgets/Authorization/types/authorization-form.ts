export type AuthorizationMode = 'login' | 'register';

export type AuthorizationFormValue = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  inviterReferralCode: string;
};