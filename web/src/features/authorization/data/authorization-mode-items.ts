import type { AuthorizationMode } from '../types/authorization-form';

export const authorizationModeItems: {
  mode: AuthorizationMode;
  label: string;
}[] = [
  {
    mode: 'login',
    label: 'Вход',
  },
  {
    mode: 'register',
    label: 'Регистрация',
  },
];