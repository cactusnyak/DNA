export type AuthorizationMode = 'login' | 'register';

export type AuthorizationFormValue = {
  email: string;
  password: string;
  nickname: string;
  firstName: string;
  lastName: string;
  patronymic: string;
  phone: string;
  inviterReferralCode: string;
};