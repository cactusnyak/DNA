import type { AuthorizationFormValue } from '../types/authorization-form';

export const initialAuthorizationFormValue: AuthorizationFormValue = {
  login: '',
  nickname: '',
  otpCode: '',
  inviterReferralCode: '',
};

type GetInitialAuthorizationFormValueParams = {
  inviterReferralCode?: string;
};

export function getInitialAuthorizationFormValue({
  inviterReferralCode = '',
}: GetInitialAuthorizationFormValueParams = {}): AuthorizationFormValue {
  return {
    ...initialAuthorizationFormValue,
    inviterReferralCode,
  };
}