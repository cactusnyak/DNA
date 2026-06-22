import type { UserRole } from './user-role';

export type UserRoleLabel =
  | 'Покупатель'
  | 'Реферальный партнёр'
  | 'Продавец'
  | 'Администратор';

export const USER_ROLE_LABELS: Record<UserRole, UserRoleLabel> = {
  DEFAULT: 'Покупатель',
  REFERRAL_PARTNER: 'Реферальный партнёр',
  SELLER: 'Продавец',
  ADMIN: 'Администратор',
};