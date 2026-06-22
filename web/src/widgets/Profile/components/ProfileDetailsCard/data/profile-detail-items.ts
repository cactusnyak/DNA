import { USER_ROLE_LABELS, type User } from '@/entities/user';
import { formatPrice } from '@/shared/utils/format-price';

export type ProfileDetailItem = {
  label: string;
  value: string;
  isAccent?: boolean;
};

export function getProfileDetailItems(user: User): ProfileDetailItem[] {
  const balanceValue = user.balance?.value ?? 0;

  return [
    { label: 'Имя', value: user.firstName },
    { label: 'Фамилия', value: user.lastName },
    { label: 'Email', value: user.email },
    { label: 'Телефон', value: user.phone ?? 'Не указан' },
    { label: 'Роль', value: USER_ROLE_LABELS[user.role] },
    { label: 'Реферальный код', value: user.referralCode ?? 'Не создан' },
    { label: 'Баланс', value: formatPrice(balanceValue), isAccent: true },
  ];
}