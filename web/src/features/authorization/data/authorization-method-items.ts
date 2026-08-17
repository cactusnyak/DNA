import type { AuthorizationFormMethod } from '../types/authorization-form';

export const authorizationMethodItems: {
  method: AuthorizationFormMethod;
  label: string;
}[] = [
  {
    method: 'email_password',
    label: 'Email и пароль',
  },
  {
    method: 'email_otp',
    label: 'Email и код',
  },
  {
    method: 'otp',
    label: 'Телефон и код',
  },
];
