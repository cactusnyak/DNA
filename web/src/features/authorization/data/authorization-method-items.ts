import type { AuthorizationFormMethod } from '../types/authorization-form';

export const authorizationMethodItems: {
  method: AuthorizationFormMethod;
  label: string;
}[] = [
  {
    method: 'email',
    label: 'Email',
  },
  {
    method: 'otp',
    label: 'По коду',
  },
];
