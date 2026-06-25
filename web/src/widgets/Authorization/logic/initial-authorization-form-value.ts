import type { AuthorizationFormValue } from '../types/authorization-form';

export const initialAuthorizationFormValue: AuthorizationFormValue = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  phone: '',
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